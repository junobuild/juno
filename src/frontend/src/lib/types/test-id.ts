type TestCTAType = 'btn' | 'link';

type TestAction = string;

export type TestId = `${TestCTAType}-${TestAction}`;

type TestSuite = string;

export type TestIds = Record<TestSuite, Record<string, TestId>>;
