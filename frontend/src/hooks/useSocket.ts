import { useEffect, useCallback } from "react";
import { socketService } from "../services/socket.service";
import type {
  ItemStatusChanged,
  SectionFilled,
  SubmissionNew,
} from "../types/submission.types";

export const useSocket = (formId?: string, token?: string) => {
  useEffect(() => {
    socketService.connect(token);

    if (formId) {
      socketService.joinForm(formId);
    }

    return () => {
      if (formId) {
        socketService.leaveForm(formId);
      }
    };
  }, [formId, token]);

  const onItemStatusChanged = useCallback(
    (handler: (data: ItemStatusChanged) => void) => {
      const socket = socketService.getSocket();
      if (!socket) return;

      socket.on("item:statusChanged", handler);
      return () => {
        socket.off("item:statusChanged", handler);
      };
    },
    [],
  );

  const onSectionFilled = useCallback(
    (handler: (data: SectionFilled) => void) => {
      const socket = socketService.getSocket();
      if (!socket) return;

      socket.on("section:filled", handler);
      return () => {
        socket.off("section:filled", handler);
      };
    },
    [],
  );

  const onSubmissionNew = useCallback(
    (handler: (data: SubmissionNew) => void) => {
      const socket = socketService.getSocket();
      if (!socket) return;

      socket.on("submission:new", handler);
      return () => {
        socket.off("submission:new", handler);
      };
    },
    [],
  );

  return {
    onItemStatusChanged,
    onSectionFilled,
    onSubmissionNew,
  };
};
