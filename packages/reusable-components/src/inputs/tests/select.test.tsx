import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { Field } from "../ui/components/field";
import { Select, type SelectOption, type SelectOptionGroup } from "../ui/components/select";

const countries: (SelectOption | SelectOptionGroup)[] = [
  { label: "Romania", value: "ro" },
  { disabled: true, label: "Germany", value: "de" },
  { label: "Americas", options: [{ label: "United States", value: "us" }] },
];

function selectedText(element: Element) {
  return (element as HTMLSelectElement).selectedOptions[0]?.textContent;
}

describe("Select", () => {
  it("shows the value its parent decides on", async () => {
    function Locked() {
      const [value, setValue] = useState("ro");

      return <Select aria-label="Country" onValueChange={() => setValue("ro")} options={countries} value={value} />;
    }

    const screen = await render(<Locked />);

    await screen.getByRole("combobox").selectOptions("us");
    await expect.element(screen.getByRole("combobox")).toHaveValue("ro");
  });

  it("renders options and groups and reports the choice", async () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const screen = await render(
      <Select
        aria-label="Country"
        onChange={onChange}
        onValueChange={onValueChange}
        options={countries}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Country" });

    await expect.element(screen.getByRole("option", { name: "Germany" })).toBeDisabled();
    expect(screen.container.querySelector("optgroup")).toHaveAttribute("label", "Americas");

    await select.selectOptions("us");

    expect(onValueChange).toHaveBeenLastCalledWith("us");
    expect(onChange).toHaveBeenCalled();
    await expect.element(select).toHaveValue("us");
  });

  it("starts on the placeholder, which can't be picked back", async () => {
    const screen = await render(
      <Select aria-label="Country" options={countries} placeholder="Pick a country" required />,
    );
    const select = screen.getByRole("combobox").element();
    const placeholder = select.querySelector("option.rc-select__placeholder")!;

    await expect.element(screen.getByRole("combobox")).toHaveValue("");
    expect(selectedText(select)).toBe("Pick a country");
    expect(placeholder).toBeDisabled();
    expect(placeholder).toHaveAttribute("hidden");
    expect((select as HTMLSelectElement).validity.valueMissing).toBe(true);
  });

  it("keeps an uncontrolled default value next to a placeholder", async () => {
    const screen = await render(
      <Select aria-label="Country" defaultValue="ro" options={countries} placeholder="Pick" />,
    );

    await expect.element(screen.getByRole("combobox")).toHaveValue("ro");
  });

  it("can be controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState("ro");

      return (
        <>
          <Select aria-label="Country" onValueChange={setValue} options={countries} value={value} />
          <p>Chosen: {value}</p>
        </>
      );
    }

    const screen = await render(<Controlled />);

    await screen.getByRole("combobox").selectOptions("us");

    await expect.element(screen.getByText("Chosen: us")).toBeVisible();
  });

  it("takes <option> children, a prefix and a custom icon", async () => {
    const screen = await render(
      <Select
        aria-label="Size"
        classNames={{ icon: "chevron", select: "picker" }}
        icon={<span>▾</span>}
        prefix="Size"
      >
        <option value="s">Small</option>
        <option value="m">Medium</option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Size" });

    await expect.element(select).toHaveValue("s");
    await expect.element(select).toHaveClass("rc-select__control", "picker");
    await expect.element(screen.getByText("▾")).toBeVisible();
    expect(screen.getByText("▾").element().parentElement).toHaveClass("rc-select__icon", "chevron");
    await expect.element(screen.getByText("Size", { exact: true })).toHaveClass("rc-input__prefix");
  });

  it("joins a Field, forwards the ref, and shows the placeholder again when its parent clears it", async () => {
    const ref = createRef<HTMLSelectElement>();

    function Clearable() {
      const [value, setValue] = useState("");

      return (
        <>
          <Field error="Pick a country." label="Country">
            <Select
              name="country"
              onValueChange={setValue}
              options={countries}
              placeholder="Pick"
              ref={ref}
              value={value}
            />
          </Field>
          <button onClick={() => setValue("")} type="button">
            Clear
          </button>
        </>
      );
    }

    const screen = await render(<Clearable />);
    const select = screen.getByRole("combobox", { name: "Country" });

    expect(ref.current).toBe(select.element());
    await expect.element(select).toHaveAttribute("name", "country");
    await expect.element(select).toHaveAccessibleDescription("Pick a country.");
    await expect.element(select).toHaveAttribute("aria-invalid", "true");

    await select.selectOptions("ro");
    await expect.element(select).toHaveValue("ro");
    await screen.getByRole("button", { name: "Clear" }).click();
    await expect.element(select).toHaveValue("");
    expect(selectedText(select.element())).toBe("Pick");
  });
});
