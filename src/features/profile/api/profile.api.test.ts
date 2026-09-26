import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/api";
import { uploadAvatarRequest } from "./profile.api";

afterEach(() => vi.restoreAllMocks());

describe("avatar upload request", () => {
  it("is sent as multipart with the image under 'file', not as the client's default JSON", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: {} });
    await uploadAvatarRequest(new Blob(["jpeg"], { type: "image/jpeg" }));

    const [url, body, config] = post.mock.calls[0];
    expect(url).toBe("v1/profile/avatar");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBeInstanceOf(Blob);
    expect(config?.headers).toMatchObject({ "Content-Type": "multipart/form-data" });
  });
});
