import React from 'react';
import ReactMarkdown from 'react-markdown';
import README from '@semcore/email/README.md';
import FormatText from '@docs/../client/components/FormatText';

export default () => (
  <FormatText>
    <ReactMarkdown source={README} />
  </FormatText>
);
