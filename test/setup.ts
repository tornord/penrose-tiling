import chai from "chai";
import chaiAlmost from "chai-almost";

// Make sure dates are displayed in the correct timezone
process.env.TZ = "Europe/Stockholm";

// Tests should always run in test environment to prevent accidental deletion of
// real elasticsearch indices etc.
// This file is required with ./test/mocha.opts
process.env.NODE_ENV = "test";

chai.config.truncateThreshold = 0;
chai.config.includeStack = true;
chai.use(chaiAlmost());

declare global {
  export const expect: Chai.ExpectStatic;
}
