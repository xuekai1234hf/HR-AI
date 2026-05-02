import assert from "node:assert/strict";
import test from "node:test";
import { parseEmployees, parseRules } from "../src/schema.js";

test("parseEmployees accepts valid employee records", () => {
  const employees = parseEmployees([
    {
      id: "E001",
      name: "李雷",
      type: "full_time",
      startDate: "2026-05-06",
      submittedDocuments: ["身份证", "银行卡"]
    }
  ]);

  assert.equal(employees[0].id, "E001");
  assert.deepEqual(employees[0].submittedDocuments, ["身份证", "银行卡"]);
});

test("parseEmployees rejects non-array submittedDocuments with employee id", () => {
  assert.throws(
    () =>
      parseEmployees([
        {
          id: "E002",
          name: "韩梅梅",
          type: "intern",
          startDate: "2026-05-08",
          submittedDocuments: "身份证"
        }
      ]),
    /Employee E002 submittedDocuments must be an array/
  );
});

test("parseRules accepts valid rules", () => {
  const rules = parseRules({
    commonRequiredDocuments: ["身份证"],
    typeRequiredDocuments: {
      full_time: ["劳动合同"]
    }
  });

  assert.deepEqual(rules.commonRequiredDocuments, ["身份证"]);
  assert.deepEqual(rules.typeRequiredDocuments.full_time, ["劳动合同"]);
});

test("parseRules rejects missing commonRequiredDocuments", () => {
  assert.throws(
    () =>
      parseRules({
        typeRequiredDocuments: {
          full_time: ["劳动合同"]
        }
      }),
    /rules.commonRequiredDocuments must be an array/
  );
});
