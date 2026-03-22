import React, { PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react";

function AllProviders({ children }: PropsWithChildren) {
  return <>{children}</>;
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
