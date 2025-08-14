import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Users, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import hundposLogo from "@/assets/hundpos-dog-logo.png";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src={hundposLogo} 
              alt="HundPos Logo" 
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold">HundPos</span>
          </div>
          
          {user && (
            <Button onClick={() => navigate("/pos")}>
              Zur Kasse
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img 
              src={hundposLogo} 
              alt="HundPos Logo" 
              className="h-20 w-20 rounded-2xl"
            />
          </div>
          
          <Badge variant="secondary" className="mb-6">
            Modernes Kassensystem für Gastronomie
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            HundPos
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Das intelligente Kassensystem für Restaurants, Cafés und Bars. 
            Einfach zu bedienen, modern und steuerkonform.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {user ? (
              <Button size="lg" onClick={() => navigate("/pos")}>
                Zur Kasse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Anmelden / Registrieren
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  Mehr erfahren
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Einfache Bedienung</h3>
            <p className="text-muted-foreground">
              Intuitive Benutzeroberfläche für schnelles Kassieren und Bestellverwaltung.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tischverwaltung</h3>
            <p className="text-muted-foreground">
              Dynamische Tischpläne und Bestellverfolgung für optimalen Service.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Steuerkonform</h3>
            <p className="text-muted-foreground">
              GoBD-konforme Kassenbücher und automatische Backup-Funktionen.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
