import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

import { placePopover } from "../../shared/place-popover";
import { useDraft } from "../ui/components/filter-control";
import { useDelayedFlag } from "../ui/components/loading-overlay";

function box(style: Partial<CSSStyleDeclaration>) {
  const element = document.createElement("div");

  Object.assign(element.style, { position: "fixed", ...style });
  element.dataset.testBox = "";
  document.body.append(element);

  return element;
}

afterEach(() => {
  document.querySelectorAll("[data-test-box]").forEach((element) => element.remove());
  vi.useRealTimers();
});

describe("placePopover", () => {
  it("centers on its trigger", () => {
    const element = box({ height: "120px", width: "200px" });

    placePopover(element, box({ height: "30px", left: "400px", top: "100px", width: "80px" }), "center");

    expect(element.style.left).toBe("340px");
  });

  const popover = () => box({ height: "120px", width: "200px" });

  it("opens below its trigger, aligned to its start", () => {
    const element = popover();

    placePopover(element, box({ height: "30px", left: "100px", top: "100px", width: "80px" }));

    expect(element.style).toMatchObject({ left: "100px", top: "136px" });
  });

  it("aligns to the trigger's end", () => {
    const element = popover();

    placePopover(element, box({ height: "30px", left: "400px", top: "100px", width: "80px" }), "end");

    expect(element.style.left).toBe("280px");
  });

  it("flips above the trigger when there is no room below", () => {
    const element = popover();
    const top = window.innerHeight - 50;

    placePopover(element, box({ height: "30px", left: "100px", top: `${top}px`, width: "80px" }));

    expect(element.style.top).toBe(`${top - 6 - 120}px`);
  });

  it("stays inside the viewport", () => {
    const element = popover();

    placePopover(element, box({ height: "30px", left: `${window.innerWidth - 20}px`, top: "100px", width: "10px" }));

    expect(element.style.left).toBe(`${window.innerWidth - 200 - 8}px`);

    const tall = box({ height: `${window.innerHeight}px`, width: "200px" });

    placePopover(tall, box({ height: "30px", left: "100px", top: "100px", width: "80px" }));

    expect(tall.style.top).toBe("8px");
  });
});

describe("useDelayedFlag", () => {
  const timing = { delayMs: 150, minDurationMs: 300 };

  function setup() {
    return renderHook((props?: { active: boolean }) => useDelayedFlag(props?.active ?? false, timing), {
      initialProps: { active: false },
    });
  }

  it("turns on only after the delay, then stays on for the minimum duration", async () => {
    vi.useFakeTimers();
    const { act, rerender, result } = await setup();

    await rerender({ active: true });
    await act(() => vi.advanceTimersByTime(149));
    expect(result.current).toBe(false);
    await act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);

    await act(() => vi.advanceTimersByTime(100));
    await rerender({ active: false });
    await act(() => vi.advanceTimersByTime(199));
    expect(result.current).toBe(true);
    await act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it("never turns on for work shorter than the delay", async () => {
    vi.useFakeTimers();
    const { act, rerender, result } = await setup();

    await rerender({ active: true });
    await act(() => vi.advanceTimersByTime(100));
    await rerender({ active: false });
    await act(() => vi.advanceTimersByTime(1000));

    expect(result.current).toBe(false);
  });
});

describe("useDraft", () => {
  it("keeps what was typed after a commit, and follows any other change of the value", async () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();
    const initialProps: { value: unknown } = { value: undefined };
    const { act, rerender, result } = await renderHook(
      (props?: { value: unknown }) => useDraft(props?.value, onCommit, 300),
      { initialProps },
    );

    await act(() => result.current[1]("a"));
    await act(() => vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenLastCalledWith("a");

    await act(() => result.current[1]("ab"));
    await rerender({ value: "a" });
    expect(result.current[0]).toBe("ab");

    await act(() => vi.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenLastCalledWith("ab");

    await rerender({ value: undefined });
    expect(result.current[0]).toBeUndefined();
    await rerender({ value: "ab" });
    expect(result.current[0]).toBe("ab");
  });
});
