"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireDefault(require("react"));

var _core = require("@semcore/core");

var _icon = _interopRequireDefault(require("@semcore/icon"));

var _logger = _interopRequireDefault(require("@semcore/utils/lib/logger"));

var _excluded = ["width", "height", "viewBox"];

function polygon(_ref, ref) {
  var _ref$width = _ref.width,
      width = _ref$width === void 0 ? '16' : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === void 0 ? '16' : _ref$height,
      _ref$viewBox = _ref.viewBox,
      viewBox = _ref$viewBox === void 0 ? '0 0 16 16' : _ref$viewBox,
      props = (0, _objectWithoutProperties2["default"])(_ref, _excluded);

  _logger["default"].warn(true, "you are using the old icon, use import from '@semcore/icon/Name/Size'", "polygon");

  return /*#__PURE__*/_react["default"].createElement(_icon["default"], (0, _extends2["default"])({
    ref: ref,
    "data-name": "polygon",
    "data-group": "",
    width: width,
    height: height,
    viewBox: viewBox
  }, props), /*#__PURE__*/_react["default"].createElement("polygon", {
    points: "100,10 40,198 190,78 10,78 160,198"
  }));
}

polygon.displayName = 'polygon';

var _default = (0, _core.createBaseComponent)(polygon);

exports["default"] = _default;