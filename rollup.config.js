import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';

export default {
  external: ["firebase/app"],
  input: 'tmp/js/app.js',
  format: 'iife',
  globals: {
    'firebase/app': 'firebase'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': "'development'"
    }),
    resolve(),
    commonJS({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'forwardRef'],
        'node_modules/react-dom/index.js': ['findDOMNode', 'unstable_batchedUpdates', 'render']
      }
    })
  ],
  onwarn: function (warning) {
    // Suppress this error message:
    // "The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten"
    if (warning.code === 'THIS_IS_UNDEFINED') return;

    console.error(warning.message);
  }
};