import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  getPreviewStore,
  housePrefsFor,
  pushHouseNotification,
  resetPreviewStore,
  setHouseNotificationPrefs,
} from "@/lib/preview/store";

describe("house notification preferences", () => {
  beforeEach(() => {
    resetPreviewStore();
  });

  it("saves in-app, email, and digest choices", () => {
    const viewerId = getPreviewStore().viewerId;
    const prefs = setHouseNotificationPrefs(viewerId, {
      circle: { inApp: true, email: false },
      index: { inApp: false, email: false },
      digest: "off",
    });
    assert.equal(prefs.circle.inApp, true);
    assert.equal(prefs.circle.email, false);
    assert.equal(prefs.index.inApp, false);
    assert.equal(prefs.digest, "off");
    assert.equal(housePrefsFor(viewerId).digest, "off");
  });

  it("does not create an in-app notice when that channel is off", () => {
    const viewerId = getPreviewStore().viewerId;
    setHouseNotificationPrefs(viewerId, {
      events: { inApp: false, email: true },
    });
    const before = getPreviewStore().houseNotifications.length;
    const created = pushHouseNotification({
      recipientId: viewerId,
      kind: "event",
      title: "Should not appear",
      body: "Prefs said no.",
    });
    assert.equal(created, null);
    assert.equal(getPreviewStore().houseNotifications.length, before);
  });
});
