"use client";

import React, { createContext, useContext, useState } from "react";

export interface NotificationDetails {
  product_id?: number;
  product_title?: string;
  old_price?: number;
  new_price?: number;
  discount_percent?: number;
  rating?: number;
  rating_count?: number;
  estimated_sales?: number;
  sales_volume?: string;
  price?: number;
  created_at?: string;
}

export interface Notification {
  id: string;
  type: string;
  severity: string;
  platform?: string;
  message: string;
  time: string;
  details?: NotificationDetails;
}

interface AlertContextType {
  selectedAlert: Notification | null;
  isAlertDialogOpen: boolean;
  showAlertDetails: (alert: Notification) => void;
  closeAlertDialog: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [selectedAlert, setSelectedAlert] = useState<Notification | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const showAlertDetails = (alert: Notification) => {
    setSelectedAlert(alert);
    setIsAlertDialogOpen(true);
  };

  const closeAlertDialog = () => {
    setIsAlertDialogOpen(false);
  };

  return (
    <AlertContext.Provider value={{ selectedAlert, isAlertDialogOpen, showAlertDetails, closeAlertDialog }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
}
