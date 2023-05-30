module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
  },
  "extends": [
    "google",
    "plugin:react/recommended",
    "eslint:recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true,
    },
    "ecmaVersion": 12,
    "sourceType": "module",
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "@typescript-eslint",
  ],
  "rules": {
    "new-cap": "off",
    "react/prop-types": "off",
    "no-invalid-this": "off",
    "prefer-spread": "off",
    "no-undef": "off",
    "global-require": "off",
    "react/react-in-jsx-scope": "off",
    "no-caller": "warn",
    // documentation
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    //layout errors
    "max-len": "off",
    "padded-blocks": "off",
    "linebreak-style": ["off", "windows"],
    "no-unused-vars": "warn",
    "no-multi-spaces": "warn",
    "spaced-comment": "off",
    "eol-last": "warn",
    "quotes": ["warn", "double"],
    "indent": "warn",
    "no-trailing-spaces": "warn",
    "keyword-spacing": "warn",
    // might result in serious errors
    "react/jsx-key": "off",
    "guard-for-in": "off",
    "no-prototype-builtins": "off",
    "prefer-rest-params": "off",
    // deprecated code style
    "react/no-find-dom-node": "warn",
    "react/no-string-refs": "warn",
  },
  "settings": {
    "react": {
      "createClass": "createReactClass", // Regex for Component Factory to use,
      // default to "createReactClass"
      "pragma": "React", // Pragma to use, default to "React"
      "fragment": "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
      "version": "17.0.2", // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // default to latest and warns if missing
      // It will default to "detect" in the future
      "flowVersion": "0.53", // Flow version
    },
    "propWrapperFunctions": [
      // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
      "forbidExtraProps",
      {"property": "freeze", "object": "Object"},
      {"property": "myFavoriteWrapper"},
      // for rules that check exact prop wrappers
      {"property": "forbidExtraProps", "exact": true},
    ],
    "componentWrapperFunctions": [
      // The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
      "observer", // `property`
      {"property": "styled"}, // `object` is optional
      {"property": "observer", "object": "Mobx"},
      {"property": "observer", "object": "<pragma>"}, // sets `object` to whatever value `settings.react.pragma` is set to
    ],
    "formComponents": [
      // Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
      "CustomForm",
      {"name": "Form", "formAttribute": "endpoint"},
    ],
  },
};
