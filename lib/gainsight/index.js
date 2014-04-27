
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var BadRequest = integration.errors.BadRequest;

/**
 * Expose `Gainsight`
 */

var Gainsight = module.exports = integration('Gainsight')
  .endpoint('https://dev-gs-event.herokuapp.com')
  .retries(2);

/**
 * Validate.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Error}
 * @api public
 */

Gainsight.prototype.validate = function(message, settings){
  return this.ensure(settings.accessKey, 'accessKey')
};

/**
 * Track.
 *
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Gainsight.prototype.track = function(payload, settings, fn){
  return this
    .post('/event/track')
    .set('accessKey',settings.accessKey)
    .type('json')
    .send(payload)
    .end(this.check(fn));
};

/**
 * Check respponse with `fn(err, res)`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Function}
 * @api private
 */

Gainsight.prototype.check = function(fn){
  var self = this;
  return this.handle(function(err, res){
    if (err) return fn(err);
    var event = Object.keys(res.body)[0];
    var results = res.body[event];
    var failures = 0;
    var error;
    var err;

    if (!results) {
      err = new BadRequest('Received a bad Gainsight response', 200, res.body);
      return fn(err);
    }

    if (failures) {
      err = new BadRequest(error, 200, res.body);
      return fn(err);
    }

    fn(null, res);
  });
};
