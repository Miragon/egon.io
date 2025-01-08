/**
 * The code in the <project-logo></project-logo> area
 * must not be changed.
 *
 * @see http://bpmn.io/license for more information.
 */
import {
  assign,
  find,
  isNumber,
  omit
} from 'min-dash';

import {
  domify,
  assignStyle,
  query as domQuery,
  remove as domRemove
} from 'min-dom';

import {
  innerSVG
} from 'tiny-svg';

import Diagram from 'diagram-js';

import inherits from 'inherits-browser';

export default function BaseViewer(options) {

  options = assign({}, DEFAULT_OPTIONS, options);

  this._container = this._createContainer(options);

  /* <project-logo> */
  addProjectLogo(this._container);
  /* </project-logo> */

  this._init(this._container, options);
}

inherits(BaseViewer, Diagram);

//TODO-RIP_BPMN do we need this?
// BaseViewer.prototype.open = async function open(bpmnDiagramOrId) {
//
//   const definitions = this._definitions;
//   let bpmnDiagram = bpmnDiagramOrId;
//
//   if (!definitions) {
//     const error = new Error('no XML imported');
//     addWarningsToError(error, []);
//
//     throw error;
//   }
//
//   if (typeof bpmnDiagramOrId === 'string') {
//     bpmnDiagram = findBPMNDiagram(definitions, bpmnDiagramOrId);
//
//     if (!bpmnDiagram) {
//       const error = new Error('BPMNDiagram <' + bpmnDiagramOrId + '> not found');
//       addWarningsToError(error, []);
//
//       throw error;
//     }
//   }
//
//   // clear existing rendered diagram
//   // catch synchronous exceptions during #clear()
//   try {
//     this.clear();
//   } catch (error) {
//     addWarningsToError(error, []);
//
//     throw error;
//   }
//
//   // perform graphical import
//   const { warnings } = await importBpmnDiagram(this, definitions, bpmnDiagram);
//
//   return { warnings };
// };

BaseViewer.prototype.saveSVG = async function saveSVG() {
  this._emit('saveSVG.start');

  let svg, err;

  try {
    const canvas = this.get('canvas');

    const contentNode = canvas.getActiveLayer(),
      defsNode = domQuery(':scope > defs', canvas._svg);

    const contents = innerSVG(contentNode),
      defs = defsNode ? '<defs>' + innerSVG(defsNode) + '</defs>' : '';

    const bbox = contentNode.getBBox();

    svg =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<!-- created with bpmn-js / http://bpmn.io -->\n' + //TODO-RIP-BPMN
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'width="' + bbox.width + '" height="' + bbox.height + '" ' +
      'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
      defs + contents +
      '</svg>';
  } catch (e) {
    err = e;
  }

  this._emit('saveSVG.done', {
    error: err,
    svg: svg
  });

  if (err) {
    throw err;
  }

  return { svg };
};

//TODO-RIP_BPMN do we need this?

// BaseViewer.prototype._setDefinitions = function(definitions) {
//   this._definitions = definitions;
// };

BaseViewer.prototype.getModules = function() {
  return this._modules;
};

BaseViewer.prototype.clear = function() {
  if (!this.getDefinitions()) {

    // no diagram to clear
    return;
  }

  // remove drawn elements
  Diagram.prototype.clear.call(this);
};

BaseViewer.prototype.destroy = function() {

  // diagram destroy
  Diagram.prototype.destroy.call(this);

  // dom detach
  domRemove(this._container);
};

BaseViewer.prototype.on = function(events, priority, callback, that) {
  return this.get('eventBus').on(events, priority, callback, that);
};

BaseViewer.prototype.off = function(events, callback) {
  this.get('eventBus').off(events, callback);
};

BaseViewer.prototype.attachTo = function(parentNode) {

  if (!parentNode) {
    throw new Error('parentNode required');
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  parentNode.appendChild(this._container);

  this._emit('attach', {});

  this.get('canvas').resized();
};

//TODO-RIP_BPMN do we need this?

// BaseViewer.prototype.getDefinitions = function() {
//   return this._definitions;
// };

BaseViewer.prototype.detach = function() {

  const container = this._container,
    parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }
  this._emit('detach', {});

  parentNode.removeChild(container);
};

BaseViewer.prototype._init = function(container, options) {

  const baseModules = options.modules || this.getModules(options),
    additionalModules = options.additionalModules || [],
    staticModules = [
      {
        bpmnjs: [ 'value', this ]
      }
    ];

  const diagramModules = [].concat(staticModules, baseModules, additionalModules);

  const diagramOptions = assign(omit(options, [ 'additionalModules' ]), {
    canvas: assign({}, options.canvas, { container: container }),
    modules: diagramModules
  });

  // invoke diagram constructor
  Diagram.call(this, diagramOptions);

  if (options && options.container) {
    this.attachTo(options.container);
  }
};

BaseViewer.prototype._emit = function(type, event) {
  return this.get('eventBus').fire(type, event);
};

BaseViewer.prototype._createContainer = function(options) {

  const container = domify('<div class="egon-container"></div>');

  assignStyle(container, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

BaseViewer.prototype._modules = [];

// helpers ///////////////

function addWarningsToError(err, warningsAry) {
  err.warnings = warningsAry;
  return err;
}

function checkValidationError(err) {

  // check if we can help the user by indicating wrong BPMN 2.0 xml
  // (in case he or the exporting tool did not get that right)

  const pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
  const match = pattern.exec(err.message);

  if (match) {
    err.message =
      'unparsable content <' + match[1] + '> detected; ' +
      'this may indicate an invalid BPMN 2.0 diagram file' + match[2];
  }

  return err;
}

const DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  position: 'relative'
};


/**
 * Ensure the passed argument is a proper unit (defaulting to px)
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '');
}

//TODO-RIP_BPMN do we need this?

// /**
//  * Find BPMNDiagram in definitions by ID
//  *
//  * @param {ModdleElement<Definitions>} definitions
//  * @param {string} diagramId
//  *
//  * @return {ModdleElement<BPMNDiagram>|null}
//  */
// function findBPMNDiagram(definitions, diagramId) {
//   if (!diagramId) {
//     return null;
//   }
//
//   return find(definitions.diagrams, function(element) {
//     return element.id === diagramId;
//   }) || null;
// }


/* <project-logo> */

import {
  open as openPoweredBy,
  BPMNIO_IMG,
  LOGO_STYLES,
  LINK_STYLES
} from './copiedClasses/PoweredByUtil';

import {
  event as domEvent
} from 'min-dom';

/**
 * Adds the project logo to the diagram container as
 * required by the bpmn.io license.
 *
 * @see http://bpmn.io/license
 *
 * @param {Element} container
 */
function addProjectLogo(container) {
  const img = BPMNIO_IMG;

  const linkMarkup =
    '<a href="http://bpmn.io" ' +
    'target="_blank" ' +
    'class="bjs-powered-by" ' +
    'title="Powered by bpmn.io" ' +
    '>' +
    img +
    '</a>';

  const linkElement = domify(linkMarkup);

  assignStyle(domQuery('svg', linkElement), LOGO_STYLES);
  assignStyle(linkElement, LINK_STYLES, {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    zIndex: '100'
  });

  container.appendChild(linkElement);

  domEvent.bind(linkElement, 'click', function(event) {
    openPoweredBy();

    event.preventDefault();
  });
}

/* </project-logo> */
