import { Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import hundposLogo from "@/assets/hundpos-logo.png";

interface PosHeaderProps {
  currentUser?: string;
  businessName?: string;
}

export function PosHeader({ currentUser = "Kassier", businessName = "HundPos Restaurant" }: PosHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-card">
      <div className="flex items-center gap-4">
        <img 
          src={hundposLogo} 
          alt="HundPos Logo" 
          className="h-10 w-10 rounded-lg"
        />
        <div>
          <h1 className="text-xl font-bold text-foreground">HundPos</h1>
          <p className="text-sm text-muted-foreground">{businessName}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">
            {currentTime.toLocaleTimeString('de-DE')}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="text-sm">{currentUser}</span>
        </div>

        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString('de-DE', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    </header>
  );
}