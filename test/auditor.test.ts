import assert from "node:assert/strict";
import test from "node:test";
import { auditEmployees } from "../src/auditor.js";
import type { Employee, Rules } from "../src/schema.js";

const rules: Rules = {
  commonRequiredDocuments: ["身份证", "银行卡", "个人信息登记表"],
  typeRequiredDocuments: {
    full_time: ["学历证明", "劳动合同"],
    intern: ["学生证", "实习协议"]
  }
};

test("auditEmployees returns OK when all required documents are submitted", () => {
  const employees: Employee[] = [
    {
      id: "E001",
      name: "李雷",
      type: "full_time",
      startDate: "2026-05-06",
      submittedDocuments: ["身份证", "银行卡", "个人信息登记表", "学历证明", "劳动合同"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0], {
    employeeId: "E001",
    employeeName: "李雷",
    employeeType: "full_time",
    missingDocuments: [],
    completionRate: 1,
    riskLevel: "OK"
  });
});

test("auditEmployees returns WARN when one document is missing", () => {
  const employees: Employee[] = [
    {
      id: "E002",
      name: "韩梅梅",
      type: "intern",
      startDate: "2026-05-08",
      submittedDocuments: ["身份证", "银行卡", "个人信息登记表", "学生证"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0].missingDocuments, ["实习协议"]);
  assert.equal(results[0].completionRate, 0.8);
  assert.equal(results[0].riskLevel, "WARN");
});

test("auditEmployees returns BLOCKED when two or more documents are missing", () => {
  const employees: Employee[] = [
    {
      id: "E003",
      name: "王五",
      type: "full_time",
      startDate: "2026-05-10",
      submittedDocuments: ["身份证", "银行卡"]
    }
  ];

  const results = auditEmployees(employees, rules);

  assert.deepEqual(results[0].missingDocuments, ["个人信息登记表", "学历证明", "劳动合同"]);
  assert.equal(results[0].completionRate, 0.4);
  assert.equal(results[0].riskLevel, "BLOCKED");
});

test("auditEmployees de-duplicates repeated required documents", () => {
  const duplicatedRules: Rules = {
    commonRequiredDocuments: ["身份证", "银行卡"],
    typeRequiredDocuments: {
      full_time: ["身份证", "劳动合同"]
    }
  };

  const employees: Employee[] = [
    {
      id: "E004",
      name: "赵六",
      type: "full_time",
      startDate: "2026-05-11",
      submittedDocuments: ["身份证"]
    }
  ];

  const results = auditEmployees(employees, duplicatedRules);

  assert.deepEqual(results[0].missingDocuments, ["银行卡", "劳动合同"]);
  assert.equal(results[0].completionRate, 1 / 3);
});

test("auditEmployees rejects unknown employee type with employee id", () => {
  const employees: Employee[] = [
    {
      id: "E005",
      name: "钱七",
      type: "advisor",
      startDate: "2026-05-12",
      submittedDocuments: ["身份证"]
    }
  ];

  assert.throws(() => auditEmployees(employees, rules), /Unknown employee type "advisor" for employee E005/);
});
