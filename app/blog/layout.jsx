import InPagePush from "@/components/InPagePush";
import PushNotification from "@/components/PushNotification";
import VignetteBanner from "@/components/VignetteBanner";

export default function BlogLayout({ children }) {
  return (
    <>
      <InPagePush />
      <PushNotification />
      <VignetteBanner />
      {children}
    </>
  );
}
