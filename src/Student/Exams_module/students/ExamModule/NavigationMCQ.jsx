import CountdownTimer from "./CountdownTimer";
import { NumberedNavigation } from "./NumberedNavigation";

export const NavigationMCq = () => {
  return (
    <div className="m-4 rounded-xl">
      <CountdownTimer />
      <NumberedNavigation />
    </div>
  );
};
