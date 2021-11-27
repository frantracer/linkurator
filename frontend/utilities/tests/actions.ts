import { fireEvent, waitFor, screen } from "@testing-library/dom";

export const clickOnText = async (text: string) => {
  await waitFor(() => {
    fireEvent.click(screen.getByText(text));
  });
};
