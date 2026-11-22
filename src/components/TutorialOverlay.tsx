import ResourceSheet from "./ResourceSheet";
import TrainingPractice from "./TrainingPractice";
import {useTranslation} from "@/engine/i18n";

export default function TutorialOverlay({onComplete,onSkip}:{onComplete:()=>void;onSkip:()=>void}) {
  const {t}=useTranslation();
  return <ResourceSheet title={t("training.title")} mobileOnly={false} onClose={onSkip}>
    <TrainingPractice onComplete={onComplete}/>
  </ResourceSheet>;
}
