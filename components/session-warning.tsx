"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";

// Warning at 13 minutes, logout at 15 minutes
const WARNING_INACTIVITY_MS = 13 * 60 * 1000;
const LOGOUT_INACTIVITY_MS = 15 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000; // Check every 30 seconds

export function SessionTimeoutWarning() {
    const pathname = usePathname();
    const router = useRouter();
    
    const [isOpen, setIsOpen] = useState(false);
    const [lastActiveTime, setLastActiveTime] = useState(Date.now());

    // Do not show on auth pages
    const isAuthPage = pathname?.startsWith('/auth');

    const handleActivity = useCallback(() => {
        setLastActiveTime(Date.now());
    }, []);

    useEffect(() => {
        if (isAuthPage) return;

        // Reset timer on user interaction
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthPage, handleActivity]);

    useEffect(() => {
        if (isAuthPage) return;

        const interval = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActiveTime;

            if (timeSinceLastActivity >= LOGOUT_INACTIVITY_MS) {
                // Time's up, automatically logout
                handleLogout();
            } else if (timeSinceLastActivity >= WARNING_INACTIVITY_MS && !isOpen) {
                // Approaching timeout, show warning
                setIsOpen(true);
            }
        }, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAuthPage, lastActiveTime, isOpen]);

    const handleStaySignedIn = async () => {
        setIsOpen(false);
        setLastActiveTime(Date.now());
        try {
            // A request to refresh the token, or a dummy request that will run the interceptor
            await authApi.getCurrentUser();
        } catch (error) {
            // If it fails (e.g., refresh token expired), they'll be logged out by interceptor
        }
    };

    const handleLogout = async () => {
        setIsOpen(false);
        try {
            await authApi.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            router.push('/auth/login');
        }
    };

    if (isAuthPage) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Session Expiry Warning</DialogTitle>
                    <DialogDescription>
                        You have been inactive for a while. Your session is about to expire for security reasons. Do you want to stay signed in?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 mt-4 space-y-2 sm:space-y-0">
                    <Button variant="outline" onClick={handleLogout}>Log out now</Button>
                    <Button onClick={handleStaySignedIn}>Stay signed in</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
