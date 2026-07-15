export type Locale = "en" | "fr";

export const LOCALES: Locale[] = ["en", "fr"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "betedge_locale";

/** Nested string leaves for UI copy (EN/FR). */
export type Dictionary = {
  nav: {
    odds: string;
    api: string;
    pricing: string;
    dashboard: string;
    lineMoves: string;
    settings: string;
    admin: string;
    login: string;
    startFree: string;
    signUp: string;
  };
  common: {
    loading: string;
    email: string;
    password: string;
    name: string;
    plan: string;
    save: string;
    cancel: string;
    language: string;
  };
  disclaimer: string;
  footer: { notSportsbook: string };
  landing: {
    badge: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroBody: string;
    ctaFree: string;
    ctaLogin: string;
    featuresTitle: string;
    featuresSubtitle: string;
    pricingTitle: string;
    pricingSubtitle: string;
    popular: string;
    perMonth: string;
    ctaSectionTitle: string;
    ctaSectionBody: string;
    ctaCreate: string;
    features: Array<{ title: string; body: string }>;
    tiers: Array<{
      name: string;
      blurb: string;
      features: string[];
      cta: string;
    }>;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    passwordMin: string;
    signingIn: string;
    creating: string;
    createAccount: string;
    noAccount: string;
    hasAccount: string;
    invalidCreds: string;
    regFailed: string;
  };
  dashboard: {
    title: string;
    hey: string;
    subtitle: string;
    freeUnlocks: string;
    planSuffix: string;
    todaysPicks: string;
    recentHistory: string;
    noHistory: string;
    performance: string;
    performanceFull: string;
    performanceLimited: string;
    bankroll: string;
    bankrollDesc: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profile: string;
    profileDesc: string;
    subscription: string;
    subscriptionDesc: string;
    promo: string;
    applyCode: string;
    applying: string;
    enterPromo: string;
    signOut: string;
    session: string;
    billingStatus: string;
    manageBilling: string;
    apiKeys: string;
  };
  odds: {
    title: string;
    badge: string;
    subtitle: string;
    apiDocs: string;
    lineMoves: string;
    empty: string;
  };
  lineMoves: {
    title: string;
    locked: string;
    upgrade: string;
    subtitle: string;
    publicBoard: string;
    steam: string;
    empty: string;
  };
};

const en: Dictionary = {
  nav: {
    odds: "Odds",
    api: "API",
    pricing: "Pricing",
    dashboard: "Dashboard",
    lineMoves: "Line moves",
    settings: "Settings",
    admin: "Admin",
    login: "Log in",
    startFree: "Start free",
    signUp: "Sign up",
  },
  common: {
    loading: "Loading…",
    email: "Email",
    password: "Password",
    name: "Name",
    plan: "Plan",
    save: "Save",
    cancel: "Cancel",
    language: "Language",
  },
  disclaimer:
    "For entertainment purposes only. Gambling involves risk. Past performance does not guarantee future results. You must be 18+/21+ (depending on jurisdiction) to use sports betting services. Bet responsibly.",
  footer: {
    notSportsbook: "Not a sportsbook. Tips & analytics only.",
  },
  landing: {
    badge: "AI-powered betting intelligence",
    heroTitleBefore: "Daily sports picks with",
    heroTitleAccent: "real edge analysis",
    heroBody:
      "BetEdge AI turns odds, injuries, weather, and line movement into clear, ranked picks for NFL, NBA, MLB, NHL, UFC, and Soccer — so you stop doomscrolling research at midnight.",
    ctaFree: "Get today's free pick",
    ctaLogin: "Log in",
    featuresTitle: "Built for bettors who want process",
    featuresSubtitle:
      "Not a sportsbook. A research co-pilot that ships a board you can actually action.",
    pricingTitle: "Simple freemium pricing",
    pricingSubtitle: "Cancel anytime. Stripe-secured billing.",
    popular: "Popular",
    perMonth: "/mo",
    ctaSectionTitle: "Ship your edge before first pitch / kickoff",
    ctaSectionBody:
      "Join freemium, unlock one AI pick today, upgrade when you want the full board.",
    ctaCreate: "Create free account",
    features: [
      {
        title: "AI pick engine",
        body: "Grok analyzes markets, injuries, weather, and line moves into structured daily picks.",
      },
      {
        title: "Edge + confidence",
        body: "Every pick ships with estimated edge, confidence score, and unit guidance.",
      },
      {
        title: "Performance tracker",
        body: "Transparent win rate, units, and ROI — no cherry-picked screenshots.",
      },
      {
        title: "Bankroll tools",
        body: "Fractional Kelly helper and unit sizing so you size bets like a pro.",
      },
      {
        title: "Multi-sport coverage",
        body: "NFL, NBA, MLB, NHL, UFC, and Soccer prioritized for daily slates.",
      },
      {
        title: "Responsible by design",
        body: "Clear disclaimers, no guaranteed profits, entertainment-first product framing.",
      },
      {
        title: "Odds board + API",
        body: "Public odds board, line-move history for paid plans, and a developer API with keys.",
      },
    ],
    tiers: [
      {
        name: "Free",
        blurb: "Taste the edge",
        features: [
          "1 pick per day",
          "7-day limited history",
          "Win-rate summary",
          "Bankroll calculator",
        ],
        cta: "Start free",
      },
      {
        name: "Basic",
        blurb: "Full daily board",
        features: [
          "Unlimited daily picks",
          "Full history & analytics",
          "Line moves board",
          "Odds API (2k req/day)",
        ],
        cta: "Go Basic",
      },
      {
        name: "Pro",
        blurb: "High-edge unlocks",
        features: [
          "Everything in Basic",
          "Premium high-confidence picks",
          "Odds API (20k req/day)",
          "Advanced ROI tracking",
        ],
        cta: "Go Pro",
      },
    ],
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to view today's AI picks",
    registerTitle: "Create your account",
    registerSubtitle: "Free tier includes 1 AI pick every day",
    passwordMin: "Password (min 8)",
    signingIn: "Signing in…",
    creating: "Creating…",
    createAccount: "Create account",
    noAccount: "No account?",
    hasAccount: "Already have an account?",
    invalidCreds: "Invalid email or password",
    regFailed: "Registration failed",
  },
  dashboard: {
    title: "Dashboard",
    hey: "Hey",
    subtitle: "Today's AI board · NFL → Soccer priority",
    freeUnlocks: "free unlocks left",
    planSuffix: "plan",
    todaysPicks: "Today's picks",
    recentHistory: "Recent history",
    noHistory: "No historical picks in your plan window.",
    performance: "Performance tracker",
    performanceFull: "All-time graded picks (demo + live).",
    performanceLimited: "Free plan shows summary only. Upgrade for full ROI analytics.",
    bankroll: "Bankroll calculator",
    bankrollDesc:
      "Unit sizing + fractional Kelly helper. Educational only — not financial advice.",
  },
  settings: {
    title: "Settings",
    subtitle: "Profile, plan, and billing",
    profile: "Profile",
    profileDesc: "Account details",
    subscription: "Subscription",
    subscriptionDesc: "Upgrade for unlimited picks and full analytics",
    promo: "Have a promo code?",
    applyCode: "Apply code",
    applying: "Applying…",
    enterPromo: "Enter promo code",
    signOut: "Sign out",
    session: "Session",
    billingStatus: "Billing status",
    manageBilling: "Manage billing",
    apiKeys: "Developer API keys",
  },
  odds: {
    title: "Public odds board",
    badge: "BetEdge Odds",
    subtitle:
      "Free snapshot of markets we store in our odds layer. For live line steam and history, upgrade to Basic/Pro or use the developer API.",
    apiDocs: "API docs",
    lineMoves: "Line moves",
    empty: "No odds snapshots yet. An admin/cron ingest will populate this board.",
  },
  lineMoves: {
    title: "Line moves",
    locked:
      "Track steam and price changes across our odds layer. Available on Basic and Pro.",
    upgrade: "Upgrade plan",
    subtitle: "Largest American-odds swings from stored snapshots (last 72h)",
    publicBoard: "Public board",
    steam: "Steam board",
    empty: "No moves yet — run odds ingest twice (admin or cron) to create history.",
  },
}

const fr: Dictionary = {
  nav: {
    odds: "Cotes",
    api: "API",
    pricing: "Tarifs",
    dashboard: "Tableau de bord",
    lineMoves: "Mouvements de cotes",
    settings: "Paramètres",
    admin: "Admin",
    login: "Connexion",
    startFree: "Essai gratuit",
    signUp: "S'inscrire",
  },
  common: {
    loading: "Chargement…",
    email: "Courriel",
    password: "Mot de passe",
    name: "Nom",
    plan: "Forfait",
    save: "Enregistrer",
    cancel: "Annuler",
    language: "Langue",
  },
  disclaimer:
    "À des fins de divertissement seulement. Les paris comportent des risques. Les rÃ©sultats passÃ©s ne garantissent pas les rÃ©sultats futurs. Vous devez avoir 18 ans et + / 21 ans et + (selon la juridiction) pour utiliser des services de paris sportifs. Pariez de faÃ§on responsable.",
  footer: {
    notSportsbook: "Pas un site de paris. Conseils et analyses seulement.",
  },
  landing: {
    badge: "Intelligence de paris propulsée par l'IA",
    heroTitleBefore: "Choix sportifs quotidiens avec",
    heroTitleAccent: "vraie analyse d'avantage",
    heroBody:
      "BetEdge AI transforme cotes, blessures, météo et mouvements de lignes en choix clairs et classés pour la NFL, NBA, MLB, LNH, UFC et le soccer — pour arrêter de scroller la recherche à minuit.",
    ctaFree: "Obtenir le choix gratuit du jour",
    ctaLogin: "Connexion",
    featuresTitle: "Conçu pour les parieurs qui veulent une méthode",
    featuresSubtitle:
      "Pas un site de paris. Un copilote de recherche qui livre un tableau actionnable.",
    pricingTitle: "Tarification freemium simple",
    pricingSubtitle: "Annulez en tout temps. Facturation sécurisée via Stripe.",
    popular: "Populaire",
    perMonth: "/mois",
    ctaSectionTitle: "Livrez votre avantage avant le coup d'envoi",
    ctaSectionBody:
      "Rejoignez le freemium, débloquez un choix IA aujourd'hui, passez à un forfait payant pour le tableau complet.",
    ctaCreate: "Créer un compte gratuit",
    features: [
      {
        title: "Moteur de choix IA",
        body: "Grok analyse marchés, blessures, météo et mouvements pour des choix structurés chaque jour.",
      },
      {
        title: "Avantage + confiance",
        body: "Chaque choix inclut un avantage estimé, un score de confiance et un guide d'unités.",
      },
      {
        title: "Suivi de performance",
        body: "Taux de réussite, unités et ROI transparents — pas de captures sélectionnées.",
      },
      {
        title: "Outils de bankroll",
        body: "Kelly fractionnaire et taille d'unité pour gérer vos mises comme un pro.",
      },
      {
        title: "Couverture multi-sports",
        body: "NFL, NBA, MLB, LNH, UFC et soccer prioritaires pour les slates du jour.",
      },
      {
        title: "Responsable par conception",
        body: "Avertissements clairs, aucun profit garanti, cadre divertissement d'abord.",
      },
      {
        title: "Tableau des cotes + API",
        body: "Tableau public, historique des mouvements pour les forfaits payants, et API développeur.",
      },
    ],
    tiers: [
      {
        name: "Gratuit",
        blurb: "Goûtez l'avantage",
        features: [
          "1 choix par jour",
          "Historique limité 7 jours",
          "Résumé du taux de réussite",
          "Calculateur de bankroll",
        ],
        cta: "Commencer gratuitement",
      },
      {
        name: "Basic",
        blurb: "Tableau quotidien complet",
        features: [
          "Choix quotidiens illimités",
          "Historique et analyses complets",
          "Tableau des mouvements",
          "API cotes (2k req/jour)",
        ],
        cta: "Passer à Basic",
      },
      {
        name: "Pro",
        blurb: "Déblocages haut avantage",
        features: [
          "Tout de Basic",
          "Choix premium haute confiance",
          "API cotes (20k req/jour)",
          "Suivi ROI avancé",
        ],
        cta: "Passer à Pro",
      },
    ],
  },
  auth: {
    loginTitle: "Bon retour",
    loginSubtitle: "Connectez-vous pour voir les choix IA du jour",
    registerTitle: "Créer votre compte",
    registerSubtitle: "Le forfait gratuit inclut 1 choix IA par jour",
    passwordMin: "Mot de passe (min. 8)",
    signingIn: "Connexion…",
    creating: "Création…",
    createAccount: "Créer le compte",
    noAccount: "Pas de compte?",
    hasAccount: "Déjà un compte?",
    invalidCreds: "Courriel ou mot de passe invalide",
    regFailed: "Échec de l'inscription",
  },
  dashboard: {
    title: "Tableau de bord",
    hey: "Salut",
    subtitle: "Tableau IA du jour · NFL → Soccer",
    freeUnlocks: "déblocages gratuits restants",
    planSuffix: "forfait",
    todaysPicks: "Choix du jour",
    recentHistory: "Historique récent",
    noHistory: "Aucun historique dans la fenêtre de votre forfait.",
    performance: "Suivi de performance",
    performanceFull: "Choix notés de tous les temps (démo + live).",
    performanceLimited:
      "Le forfait gratuit affiche un résumé seulement. Passez à un forfait payant pour le ROI complet.",
    bankroll: "Calculateur de bankroll",
    bankrollDesc:
      "Taille d'unité + Kelly fractionnaire. À titre éducatif seulement — pas un conseil financier.",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Profil, forfait et facturation",
    profile: "Profil",
    profileDesc: "Détails du compte",
    subscription: "Abonnement",
    subscriptionDesc: "Passez à un forfait payant pour des choix illimités et analyses complètes",
    promo: "Vous avez un code promo?",
    applyCode: "Appliquer le code",
    applying: "Application…",
    enterPromo: "Entrez le code promo",
    signOut: "Déconnexion",
    session: "Session",
    billingStatus: "Statut de facturation",
    manageBilling: "Gérer la facturation",
    apiKeys: "Clés API développeur",
  },
  odds: {
    title: "Tableau public des cotes",
    badge: "BetEdge Cotes",
    subtitle:
      "Instantané gratuit des marchés stockés dans notre couche de cotes. Pour le steam en direct et l'historique, passez à Basic/Pro ou utilisez l'API.",
    apiDocs: "Docs API",
    lineMoves: "Mouvements",
    empty: "Aucune cote encore. Un ingest admin/cron remplira ce tableau.",
  },
  lineMoves: {
    title: "Mouvements de cotes",
    locked:
      "Suivez le steam et les changements de prix. Disponible avec Basic et Pro.",
    upgrade: "Améliorer le forfait",
    subtitle: "Plus grands écarts de cotes américaines (72 h)",
    publicBoard: "Tableau public",
    steam: "Tableau steam",
    empty: "Aucun mouvement — lancez l'ingest des cotes deux fois pour créer l'historique.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, fr };

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "fr";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
