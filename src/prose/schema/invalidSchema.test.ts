import { doc, li, ul } from "prose/test/builders";
import { renderNewDoc } from "prose/test/renderNewDoc";

describe("invalid schema", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
  it("list_item cannot have text content directly", () => {
    expect(() => {
      renderNewDoc(doc(ul(li("text"))));
    }).toThrowErrorMatchingInlineSnapshot(
      `"Schema error: Doc is already invalid!"`
    );
  });
});
