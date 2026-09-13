/*
  Copy for the code screen when registration sent the visitor here. Registration answers an
  address that already has an account exactly as it answers a new one, and emails the owner
  instructions instead of a code — so this screen has to cover both cases without saying which
  one applies. Saying it would hand back what the server deliberately withheld.
*/
export const registrationSubtitle = (digits: number) =>
  `إذا كان هذا البريد جديداً لدينا فقد أرسلنا إليه رمزاً مكوّناً من ${digits} أرقام. أدخله هنا لتأكيد حسابك.`;

export const EXISTING_ACCOUNT_NOTE =
  "إذا كان لهذا البريد حساب لدينا من قبل، فلن يصلك رمز، بل رسالة بما يمكنك فعله: سجّل الدخول، أو أعد تعيين كلمة المرور إن نسيتها.";

export const SIGN_IN_LINK = "تسجيل الدخول";
export const RESET_PASSWORD_LINK = "نسيت كلمة المرور؟";
