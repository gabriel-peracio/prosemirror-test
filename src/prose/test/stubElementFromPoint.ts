export function stubElementFromPoint() {
  let originalElementFromPoint = document.elementFromPoint;
  let elementFromPoint = jest.fn();

  beforeAll(() => {
    Object.assign(document, {
      elementFromPoint: elementFromPoint,
    });
  });
  afterAll(() => {
    Object.assign(document, {
      elementFromPoint: originalElementFromPoint,
    });
  });
}
