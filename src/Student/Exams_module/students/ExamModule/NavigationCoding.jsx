import CountdownTimer from "./CountdownTimer";
import { NumberedNavigation } from "./NumberedNavigation";

export const NavigationCoding = () => {
  return (
    <div className="m-4 rounded-xl h-full">
      <CountdownTimer />
      <NumberedNavigation />
    </div>
  );
};
