/**
 * Created by shyy_work on 2016/12/20.
 */
(function(m){
    m.extend({
        deferred: function () {
            return {
                promise____: {
                    onStarted: function (c) {

                    },
                    start: function (func) {

                    },
                    onCompleted: function (v) {

                    },
                    complete: function (func) {

                    },
                    onSucceed: function (v) {

                    },
                    success: function (func) {

                    },
                    onFailed: function (e) {

                    },
                    failed: function (func) {

                    },
                    onCanceled: function (e) {

                    },
                    cancel: function (func) {

                    }
                },
                promise: function () {
                    return this.promise____;
                },
                start: function (c) {
                    this.promise____.onStarted&&this.promise____.onStarted(c);
                },
                complete: function (v) {
                    this.promise____.onCompleted&&this.promise____.onCompleted(v);
                },
                success: function (v) {
                    this.promise____.onSucceed&&this.promise____.onSucceed(v);
                },
                error: function (e) {
                    this.promise____.onFailed&&this.promise____.onFailed(e);
                },
                cancel: function (e) {
                    this.promise____.onCanceled&&this.promise____.onCanceled(e);
                }
            };
        }
    });
})(mirror);