import React from 'react';
import { heavyFindNextFocusableElement } from './focus';
import { makeDataSummarizationConfig } from './hints';
import type { A11yViewProps } from './PlotA11yModule';
import { formatValue } from './serialize';
import { getIntl } from './intl';
import { summarize } from './summarize';
import { Root, sstyled } from '@semcore/core';
import styles from '../style/plotA11yView.shadow.css';

export const PlotA11yView: React.FC<A11yViewProps> = ({
  id,
  data: providedData,
  hints,
  plotLabel,
  plotRef,
  config: providedConfig,
  locale,
}) => {
  const SPlotA11yView = Root;
  const intl = React.useMemo(() => getIntl(locale), [locale]);
  const config = React.useMemo(() => makeDataSummarizationConfig(providedConfig), [providedConfig]);
  const data = React.useMemo(
    () => (Array.isArray(providedData) ? providedData : [providedData]),
    [providedData],
  );
  const keys = React.useMemo(() => {
    let fromHints: string[] = [];
    fromHints.push(...hints.fields.verticalAxes);
    fromHints.push(...hints.fields.horizontalAxes);
    fromHints.push(...hints.fields.valueAxes);
    fromHints.push(...Object.keys(hints.fields.values));

    fromHints = [...new Set(fromHints)].filter((key) => key in data[0]);

    if (fromHints.length === 0) {
      data.forEach((row) => fromHints.push(...Object.keys(row)));
    }

    return [...new Set(fromHints)];
  }, [data, hints]);
  const duplicatedBaseKeys = React.useMemo(() => {
    const baseKeys = keys
      .filter((key) => !hints.title.values[key])
      .map((key) => {
        if (hints.fields.verticalAxes.has(key) && hints.title.verticalAxes)
          return [key, hints.title.verticalAxes];
        if (hints.fields.horizontalAxes.has(key) && hints.title.horizontalAxes)
          return [key, hints.title.horizontalAxes];
      })
      .filter((entry) => entry !== undefined)
      .map((entry) => entry!);
    const doublicated: Record<string, true> = {};
    const handled: Record<string, string> = {};
    for (const [key, label] of baseKeys) {
      if (handled[label]) {
        doublicated[key] = true;
        doublicated[handled[label]] = true;
      }
      handled[label] = key;
    }
    return doublicated;
  }, [keys, hints]);
  const renderTitle = React.useCallback(
    (dataKey: string) => {
      if (hints.title.values[dataKey]) return hints.title.values[dataKey];
      if (!duplicatedBaseKeys[dataKey]) {
        if (hints.fields.verticalAxes.has(dataKey) && hints.title.verticalAxes)
          return hints.title.verticalAxes;
        if (hints.fields.horizontalAxes.has(dataKey) && hints.title.horizontalAxes)
          return hints.title.horizontalAxes;
      }

      return dataKey;
    },
    [data, hints, duplicatedBaseKeys],
  );

  const [summary, setSummary] = React.useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = React.useState(true);

  React.useEffect(() => {
    if (config.disable) {
      setSummary('');
      setGeneratingSummary(false);
      return;
    }
    if (config.overrite) {
      setSummary(config.overrite);
      setGeneratingSummary(false);
      return;
    }
    setTimeout(() => {
      setSummary(summarize(providedData, hints, config, locale));
      setGeneratingSummary(false);
    }, 0);
  }, [providedData, hints, config, locale]);

  const handleSkip = React.useCallback(() => {
    if (!plotRef.current) return;

    heavyFindNextFocusableElement(plotRef.current)?.focus();
  }, []);
  const handleSkipKeyboard = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.code !== 'Enter') return;

      handleSkip();
    },
    [handleSkip],
  );
  const handleGoToTable = React.useCallback(() => {
    dataTableRef.current?.focus();
  }, []);
  const handleGoToTableKeyboard = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.code !== 'Enter') return;

      handleGoToTable();
    },
    [handleGoToTable],
  );

  const texts = React.useMemo(
    () => ({
      label: intl.formatMessage(
        { id: 'view-label' },
        { plotLabel: plotLabel ?? intl.formatMessage({ id: 'view-default-plot-label' }) },
      ),
      close: intl.formatMessage({ id: 'view-close' }),
      skipPlot: intl.formatMessage({ id: 'view-skip-plot' }),
      goToTable: intl.formatMessage({ id: 'view-go-to-table' }),
      summary: intl.formatMessage({ id: 'view-data-summary' }),
      summaryPlaceholder: intl.formatMessage({ id: 'view-summary-placeholder' }),
      table: intl.formatMessage({ id: 'view-table' }),
    }),
    [intl, plotLabel],
  );

  const dataTableRef = React.useRef<HTMLTableElement>(null);

  return sstyled(styles)(
    <SPlotA11yView render="div" tabIndex={0} aria-label={texts.label}>
      <a aria-hidden onClick={handleSkip}>
        {texts.close}
      </a>
      <a role="link" tabIndex={0} onKeyDown={handleSkipKeyboard} onClick={handleSkip}>
        {texts.skipPlot}
      </a>
      <a role="link" tabIndex={0} onKeyDown={handleGoToTableKeyboard} onClick={handleGoToTable}>
        {texts.goToTable}
      </a>
      <strong>
        <label htmlFor={`${id}-data-summary`}>{texts.summary}</label>
      </strong>
      <div id={`${id}-data-summary`} aria-busy={generatingSummary} tabIndex={0}>
        {generatingSummary ? texts.summaryPlaceholder : summary}
      </div>
      <strong>
        <label htmlFor={`${id}-data-table`}>{texts.table}</label>
      </strong>
      <table id={`${id}-data-table`} tabIndex={0} ref={dataTableRef}>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{renderTitle(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={Object.values(row).join('-')}>
              {keys.map((key) => (
                <td key={key}>{formatValue(intl, row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SPlotA11yView>,
  ) as React.ReactElement;
};