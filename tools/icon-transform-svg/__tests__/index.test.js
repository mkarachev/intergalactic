const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const { exec } = require('child_process');
const pluginTester = require('babel-plugin-tester');

const rootPath = path.resolve(__dirname);

describe('Parsing svg', () => {
  test('Files should compile', async () => {
    const publicPath = `${rootPath}/svg`;
    await fs.emptyDir(publicPath);
    await cli(`${rootPath}/parsingSvg`, rootPath);
    //TODO for support old icons pay
    await fs.move(`${publicPath}/src/pay/polygon.svg`, `${publicPath}/pay/polygon.svg`);
    await fs.remove(`${publicPath}/src`);
    const dirFilesName = glob.sync(`${publicPath}/**/*.svg`);
    const srcFilesName = glob.sync(`${rootPath}/src/**/*.svg`);

    for (let i = 0; i < srcFilesName.length; i++) {
      let dirFileName = dirFilesName[i].split('/').slice(-3).join('/');
      let srcFileName = srcFilesName[i].split('/').slice(-3).join('/');
      //TODO for old icons
      if (srcFileName.includes('pay')) {
        dirFileName = dirFileName.split('/').slice(-2).join('/');
        srcFileName = srcFileName.split('/').slice(-2).join('/');
      }

      if (dirFileName !== srcFileName) {
        expect(dirFileName).toBe(srcFileName);
        throw Error(`File ${srcFileName} don't compile`);
      }
    }
  });
});

describe('Transform svg', () => {
  test('Files should compile', async () => {
    async function checkDistFiles(publicPath, familyIcons, opt, iconPath) {
      try {
        if (!iconPath) {
          iconPath = glob.sync(`${publicPath}/${familyIcons}/**/*.svg`)[0];
          iconPath = iconPath.replace('.svg', '').split('/').slice(opt.slice).join('/');
        }
        const isJSPathExists = await fs.pathExists(
          `${opt.rootPath || rootPath}/${iconPath}/index.js`,
        );
        const isDTSPathExists = await fs.pathExists(
          `${opt.rootPath || rootPath}/${iconPath}/index.d.ts`,
        );

        expect(isJSPathExists).toBeTruthy();
        expect(isDTSPathExists).toBeTruthy();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw Error(
          `Failed to compile ${familyIcons} images from ${publicPath
            .split('/')
            .slice(-1)}/${familyIcons}`,
        );
      }
    }

    const publicSvgPath = `${rootPath}/svg`;
    const publicSvgNewPath = `${rootPath}/svg-new`;
    await cli(`${rootPath}/transformSvg --configFile=transform-svg-legacy.config.js`, rootPath);

    await checkDistFiles(publicSvgPath, 'icon', { slice: -2, rootPath: `${rootPath}/lib` });
    await checkDistFiles(publicSvgPath, 'color', { slice: -3, rootPath: `${rootPath}/lib` });

    let iconPath = glob.sync(`${publicSvgPath}/external/**/*.svg`)[0];
    iconPath = iconPath.replace('.svg', '').split('/').slice(-3);
    iconPath = iconPath[0] + '/' + iconPath[1] + iconPath[2];
    await checkDistFiles(publicSvgPath, 'external', { rootPath: `${rootPath}/lib` }, iconPath);

    await checkDistFiles(publicSvgPath, 'pay', { slice: -2, rootPath: `${rootPath}/lib` });

    await cli(`${rootPath}/transformSvg --configFile=transform-svg.config.js`, rootPath);
    await checkDistFiles(publicSvgNewPath, 'icon', { slice: -2 });
    await checkDistFiles(publicSvgNewPath, 'color', { slice: -3 });

    let iconPathExternal = glob.sync(`${publicSvgNewPath}/external/**/*.svg`)[0];
    iconPathExternal = iconPathExternal.replace('.svg', '').split('/').slice(-3);
    iconPathExternal = iconPathExternal[0] + '/' + iconPathExternal[1] + iconPathExternal[2];
    await checkDistFiles(publicSvgNewPath, 'external', {}, iconPathExternal);

    await checkDistFiles(publicSvgNewPath, 'pay', { slice: -3 });
  });
});

const familyNameIcons = ['color', 'external', 'pay', 'path', 'pathNew'];
pluginTester({
  plugin: () => ({}),
  pluginName: 'Compare files svg old',
  filename: __filename,
  tests: familyNameIcons
    .map((name) => {
      const files = glob.sync(`${rootPath}/lib/${name}/**/*.js`);
      return files.map((filePath) => ({
        title: `File ${filePath.split('/').slice(-3).join('/')} don't have change`,
        fixture: filePath,
        outputFixture: filePath.replace('__tests__/lib', '__tests__/__fixtures__'),
      }));
    })
    .flat(),
});

pluginTester({
  plugin: () => ({}),
  pluginName: 'Compare files svg new',
  filename: __filename,
  tests: familyNameIcons
    .map((name) => {
      const files = glob.sync(`${rootPath}/${name}/**/*.js`);
      return files.map((filePath) => ({
        title: `File ${filePath.split('/').slice(-3).join('/')} don't have change`,
        fixture: filePath,
        outputFixture: filePath.replace('__tests__', '__tests__/__fixtures__'),
      }));
    })
    .flat(),
});

function cli(scriptPath, cwd, args = []) {
  return new Promise((resolve) => {
    exec(
      `node ${path.resolve(scriptPath)} ${args.join(' ')} && prettier ${rootPath}`,
      { cwd },
      (error, stdout, stderr) => {
        if (error && error.code) {
          throw Error(error);
        }
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      },
    );
  });
}