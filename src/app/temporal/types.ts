// types of information sent to workflow

export type ScheduledEmailInput = {
    emailId: string;
    recipient: string;
    subject: string;
    html: string;
    sendAt: string;
  };