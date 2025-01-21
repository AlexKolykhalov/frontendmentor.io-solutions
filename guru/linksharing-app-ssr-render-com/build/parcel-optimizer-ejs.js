//@ts-check

import { Optimizer } from "@parcel/plugin";
import { parser }    from "posthtml-parser";

/**
 * @typedef { import("posthtml-parser").Content } Content
 */

/**
 * @typedef { object } ScanResult
 * @property { number } start
 * @property { number } end
 * @property { string } value
 * @property { number } valueStart
 * @property { number } valueEnd
 */

/**
 * @typedef { object } TransformResult
 * @property { string } html Transformed html
 * @property { number } shift The difference in length between `html` and transformed `html`
 */

const settingAttrs = [
  { raw: "ejs-attr" },
  { from: "ejs-style", to: "style" },
  { from: "ejs-href", to: "href" },
  { from: "ejs-src", to: "src" },
  { from: "ejs-class", to: "class" }
]

export default new Optimizer({
  async optimize({contents, map}) {    
    if (contents.slice(0, 3) === "ejs") {      
      const newContents = contents.slice(3, contents.length);
      const result = _transform(
	newContents,
	parser(newContents, { sourceLocations: true })
      );      
      return { contents: result.html, map: map, type: "ejs" };
    }
    return { contents: contents, map: map };
  }
});

/**
 * @param {string} html
 * @param {Content} content
 * @param {number} shift - The difference in length between `html` and transformed `html`
 */
function _transform(html, content, shift = 0) {
  content.forEach(obj => {
    if (typeof obj === "object" && obj.location) {
      const tagStart = obj.location.start.column + shift;
      if (obj.attrs) {	
	settingAttrs.forEach(item => {
	  /** @type {TransformResult} */
	  let result = { html: "", shift: 0 };
	  if (item.raw && Object.keys(obj.attrs).includes(item.raw)) {
	    result = _unpack(item.raw, tagStart, html);
	    html  = result.html;
	    shift = shift + result.shift;
	  }
	  if (item.from && item.to && Object.keys(obj.attrs).includes(item.from)) {
	    result = Object.keys(obj.attrs).includes(item.to) ?
	      _addFromTo(item.from, item.to, tagStart, html):
	      _createFromTo(item.from, item.to, tagStart, html);
	    html  = result.html;
	    shift = shift + result.shift;
	  }
	});
      }
      if (obj.content) {
	const result = _transform(html, obj.content, shift);
	html         = result.html;
	shift        = result.shift; // cumulative shift from depth
      }
    }
  });

  return {
    html: html,
    content: content,
    shift: shift
  };
}

// >>> technical functions <<<

/**
 * @param {string} attr
 * @param {number} startAt
 * @param {string} html
 *
 * @return {ScanResult}
 */
function _scan(attr, startAt, html) {
  const start      = html.indexOf(attr, startAt);
  const valueStart = html.indexOf('"', start) + 1;
  const valueEnd   = html.indexOf('"', valueStart);
  const end        = valueEnd + 1;
  const value      = html.slice(valueStart, valueEnd);
  // console.log(`Finding "${attr}", scanning starts from: <${html.slice(startAt, startAt + 50)}...`);
  return {
    start: start,
    end: end,
    value: value,
    valueStart: valueStart,
    valueEnd: valueEnd
  };
}

/**
 * Removes the `attr` attribute and leaves only its value
 * @param {string} attr
 * @param {number} startAt
 * @param {string} html
 *
 * @returns {TransformResult}
 */
function _unpack(attr, startAt, html) {
  /** @type {ScanResult} */
  const result = _scan(attr, startAt, html);

  return {
    html: html.slice(0, result.start) + result.value + html.slice(result.end, html.length),
    shift: -(`${attr}=""`.length)
  }
}

/**
 * Adds a value of the `from` attribute to the `to` attribute,
 * e.g. adds to `style` attribute value of `ejs-style`
 * @param {string} from
 * @param {string} to
 * @param {number} startAt - starting search position,
 usually the beginning of the tag that contains `from` and `to` attributes
 * @param {string} html
 *
 * @returns {TransformResult}
 */
function _addFromTo(from, to, startAt, html) {
  /** @type {ScanResult} */
  const scanFromAttr = _scan(from, startAt, html);

  // remove "from" attribute
  const before     = html.slice(0, scanFromAttr.start - 1); // "- 1" to remove extra space
  const after      = html.slice(scanFromAttr.end, html.length);
  html             = before + after;
  /** @type {ScanResult} */
  const scanToAttr = _scan(to, startAt, html);

  return {
    html: html.slice(0, scanToAttr.valueStart) + scanFromAttr.value + " " + html.slice(scanToAttr.valueStart, html.length),
    shift: -(`${from}=""`.length)
  }
}

/**
 * Creates a new attribute `to` from `from` attribute,
 * e.g. creates `style` attribute from `ejs-attribute`
 * @param {string} from
 * @param {string} to
 * @param {number} startAt - starting search position,
 usually the beginning of the tag that contains `from` and `to` attributes
 * @param {string} html
 *
 * @returns {TransformResult}
 */
function _createFromTo(from, to, startAt, html) {
  /** @type {ScanResult} */
  const result = _scan(from, startAt, html);

  return {
    html: html.slice(0, result.start) + `${to}="${result.value}"` + html.slice(result.end, html.length),
    shift: -(`${from}`.length - `${to}`.length)
  }
}
