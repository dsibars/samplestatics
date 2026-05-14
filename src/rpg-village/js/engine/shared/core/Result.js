export class Result {
    constructor(success, data = null, error = null, context = {}) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.context = context;
    }

    static ok(data = null) {
        return new Result(true, data);
    }

    static fail(error, context = {}) {
        return new Result(false, null, error, context);
    }
}
