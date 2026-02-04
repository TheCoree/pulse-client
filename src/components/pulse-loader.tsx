import { Activity } from "./animate-ui/icons/activity";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { motion } from "framer-motion";

export function PulseLoader() {
  return (
    <motion.div exit={ {opacity: 0 }} transition={{ ease: 'easeOut', duration: 1 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <AnimateIcon animate animation='default-loop'><Activity size={64}/></AnimateIcon>
    </motion.div>
  );
};