import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/alert-dialog";
import { FONT } from "./settings-tokens";

interface UnsavedChangesDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesDialog({ open, onStay, onLeave }: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => (next ? undefined : onStay())}>
      <AlertDialogContent dir="rtl" style={{ fontFamily: FONT }}>
        <AlertDialogHeader>
          <AlertDialogTitle>تجاهل التغييرات؟</AlertDialogTitle>
          <AlertDialogDescription>لم تُحفظ التغييرات التي أدخلتها. إذا غادرت الآن فستفقدها.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>متابعة التعديل</AlertDialogCancel>
          <AlertDialogAction onClick={onLeave}>تجاهل التغييرات</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
