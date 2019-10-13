import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';

// current both rollup-plugin-typescript and rollup-plugin-typescript2 are listed as dependency in tsconfig
// rollup-plugin-typescript2 takes too long time (30+seconds) but will display ts error on build
// need to split up the codebase with typescript project references and see if rollup-plugin-typescript2 can be used
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
// import sizes from "rollup-plugin-sizes";

const external = [
  "moment",
  "firebase/app",
  "@firebase/firestore",
  "firebaseui",
  "chart.js",
  "mobx",
];

export default {
  // modules listed as external will no be included in app bundle
  // they must either be included as script in html
  // or copied into dist/lib in gulp task copy:libs
  external,
  input: 'src/app.ts', // can be a typescript file if we have a rollup typescript plugin
  format: 'iife',
  globals: {
    'firebase/app': 'firebase',
    'firebaseui': 'firebaseui',
    'moment': 'moment',
    'chart.js': 'Chart',
    'mobx': 'mobx',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': `'${process.env.NODE_ENV || "development"}'`
    }),
    resolve(),
    commonJS({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/index.js': ['memo', 'useDebugValue', 'useMemo', 'useCallback', 'createRef', 'Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'forwardRef', 'useRef', 'useState', 'useEffect' ],
        'node_modules/react-dom/index.js': ['findDOMNode', 'unstable_batchedUpdates', 'render'],
        '@material/react-chips': ["Chip", "ChipSet"],
        '@material/react-text-field': ["Input"],
        '@material/react-button': ["Button"],
        'firestorable': ['Collection', 'Document']
      }
    }),
    typescript(),
    // sizes() // uncomment to analyse packages sizes included in the bundle
  ],
  onwarn: function (warning) {
    // Suppress this error message:
    // "The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten"
    if (warning.code === 'THIS_IS_UNDEFINED') return;

    console.error(warning.message);
  }
};