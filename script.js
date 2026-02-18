// ============================================
// DOM ELEMENT REFERENCES
// ============================================
const CalcButton = document.getElementById("CalcButton");
const ResultArea = document.getElementById("ResultArea");
const Body = document.getElementById("Body");
const CalcBux = document.getElementById("CalcBux")
const UpgradeButton = document.getElementById("UpgradeButton")
const Title = document.getElementById("Title")

// ============================================
// GAME STATE VARIABLES
// ============================================
let CalcBuxAmount = 100;           // Player's total currency
let CalcDebounce = false;          // Prevents rapid button clicks
let EnabledUpgrades = []           // Array of purchased upgrades
let BaseCalcBuxAmount = 5;         // Base earnings per calculation
let Results = []                   // Recent calculation history
let UnlockedSkins = []             // Player's collected skins
let Div0 = false;                  // Division by zero flag
let GameSave = true;               // Save enabled flag
let SelectedSkin = "No Skin";      // Currently active skin
let AdsEnabled = false;            // Ad spam toggle
const SAVE_KEY = "Epic_Calc_Save_Lol"  // localStorage key for saves
let AccountBalance = 0;                // Bank account balance
let InterestAvailable = true;       // Bank interest cooldown flag
let MoneyOwed = 0;              // Price of loan owed
let LoanEnabled = false;

// Initialize UI with current balance
CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`

// ============================================
// DEVELOPER MODE & RESET
// ============================================
// Secret developer cheat code - infinite money

function SUPERSECRETDEVELOPERMODE() {
    console.log("SUPER SECRET DEVELOPER MODE ACTIVATED!! (your progress wont save until you reload the website)")
    saveGame()
    GameSave = false;
    CalcBuxAmount = 90823478903498432790342878923479843270984238239478902340
    CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
}

// Reset all progress to initial state
function resetCalculator() {
    CalcBuxAmount = 100;
    BaseCalcBuxAmount = 5;
    Results = [];
    EnabledUpgrades = [];
    UnlockedSkins = [];
    AdsEnabled = false;
    AccountBalance = 0;
    InterestAvailable = true;
    MoneyOwed = 0;
    LoanEnabled = false;

    CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`;
    GamblePurchaseButton.disabled = false;
    GamblePurchaseButton.textContent = "GAMBLING: 100 CALCBUX";

    localStorage.removeItem(SAVE_KEY)

    console.log("look at what you did, you destroyed everything... YOU MONSTER!")
}

// ============================================
// SAVE/LOAD SYSTEM
// ============================================
// Package current game state into saveable object
function getSaveData() {
    return {
        CalcBuxAmount,
        BaseCalcBuxAmount,
        Results,
        EnabledUpgrades,
        UnlockedSkins,
        SelectedSkin,
        AdsEnabled,
        AccountBalance,
        InterestAvailable,
        LoanEnabled,
        MoneyOwed
    }
}

// Restore game state from loaded data object
function applySaveData(data) {
    // Restore all game state with fallback defaults
    CalcBuxAmount = data.CalcBuxAmount ?? 100;
    EnabledUpgrades = data.EnabledUpgrades ?? [];
    BaseCalcBuxAmount = data.BaseCalcBuxAmount ?? 5;
    Results = data.Results ?? [];
    UnlockedSkins = data.UnlockedSkins ?? [];
    SelectedSkin = data.SelectedSkin ?? "No Skin";
    AdsEnabled = data.AdsEnabled ?? false;
    CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`;
    AccountBalance = data.AccountBalance ?? 0;
    InterestAvailable = data.InterestAvailable ?? true;
    MoneyOwed = data.MoneyOwed ?? 0;
    LoanEnabled = data.LoanEnabled ?? false;

    // Re-enable purchased upgrades based on saved state
    if (EnabledUpgrades.includes("Gambling")) {
        GamblingButton.disabled = false;
        GamblePurchaseButton.disabled = true;
    }
    // Restore 2X money upgrade if purchased
    if (EnabledUpgrades.includes("2XMoreMoney")) {
        MoneyPurchaseButton.disabled = false;
        MoneyPurchaseButton.disabled = true;
    }
    // Re-enable ads if previously activated
    if (AdsEnabled) {
        LoadAds()
    }
    // Refresh skins UI after loading saved unlocked skins
    try {
        RefreshSkins();
    } catch (e) {
        console.warn("RefreshSkins failed while applying save data:", e);
    }
}

// Save game state to browser's localStorage
function saveGame() {
    if (!GameSave) {
        console.warn("Game saving is currently disabled. Progress will not be saved.");
        return;
    }
    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(getSaveData())
    )
}

// ============================================
// CALCULATOR - MAIN LOGIC
// ============================================
// Main calculator event listener
CalcButton.addEventListener("click", function() {
    const firstNumber = document.getElementById("firstNumber");
    const secondNumber = document.getElementById("secondNumber");

    const operator = document.getElementById("Operator").value;

    // Inner function to calculate and award CalcBux earnings
    function AddCalcBux() {
        let earned = 0;
        console.log(firstNumber.value + operator + secondNumber.value)
        
        // Check if this is a new calculation (not repeated)
        if (!Results.includes(firstNumber.value + operator + secondNumber.value)) {
            // Award different amounts based on operation difficulty
            if (operator === "+") {
                earned += BaseCalcBuxAmount
            } else if (operator === "-") {
                earned += BaseCalcBuxAmount + 2
            } else if (operator === "*") {
                earned = BaseCalcBuxAmount + 4
            } else if (operator === "/") {
                if (Div0) {
                    earned -= BaseCalcBuxAmount  // Penalty for division by zero
                    Div0 = false;
                } else {
                    earned += BaseCalcBuxAmount + 6
                }
            }
        } else {
            // Reward/penalize repeated calculations
            if (Div0) {
                CalcBuxAmount -= BaseCalcBuxAmount
                Div0 = false;
                CalcBux.style.color = "red";
                setTimeout(() => {
                    CalcBux.style.color = "var(--text-color)";
                }, 400);
            } else {
                CalcBux.style.color = "green";
                setTimeout(() => {
                    CalcBux.style.color = "var(--text-color)";
                }, 400);
            }
            earned += 2
        }

        // Apply 2X money multiplier if upgrade is purchased
        if (EnabledUpgrades.includes("2XMoreMoney")) {
            earned *= 2
        }

        CalcBuxAmount += earned
        
        // Prevent money from going below zero
        if (CalcBuxAmount <= 0) {
            CalcBuxAmount = 0
        }
    }

    // Check debounce to prevent spam clicking
    if (CalcDebounce === false) {
        CalcDebounce = true
        // Animate button press with scale effects
        gsap.to(["#CalcButton"], {
            scale: 0.92,
            ease: "power1.inout",
            duration: 0.2
        });
        gsap.to(["#secondNumber", "#firstNumber"], {
            scale: 1.2,
            ease: "power1.inout",
            duration: 0.2
        });
        gsap.to(["#secondNumber", "#firstNumber", "#CalcButton"], {
            scale: 1,
            ease: "bounce.out",
            delay: 0.2
        });
        let result;

        // Addition operation - simplest calculation
        if (operator === "+") {
            result = Number(firstNumber.value) + Number(secondNumber.value);
            ResultArea.textContent = result;
            // Easter egg: 9 + 10 = 21 (joke about the song)
            if (firstNumber.value == 9 && secondNumber.value == 10) {
                ResultArea.textContent = "21"
            }

        // Subtraction operation
        } else if (operator === "-") {
            result = Number(firstNumber.value) - Number(secondNumber.value);
            ResultArea.textContent = result;

        // Multiplication operation
        } else if (operator === "*") {
            result = Number(firstNumber.value) * Number(secondNumber.value);
            ResultArea.textContent = result;

        // Division operation - watch for division by zero
        } else if (operator === "/") {
            result = Number(firstNumber.value) / Number(secondNumber.value);
            if (secondNumber.value === "0") {
                result = "Are you serious???"
                Div0 = true;
            }
            ResultArea.textContent = result;

        // Gambling/lottery operation - only available if gambling upgrade purchased
        } else if (operator === "?") {
            if (EnabledUpgrades.includes("Gambling")) {
                // Helper function for async delays
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                // Shuffle array of digits 0-9 for lottery animation
                let numstomix = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
                const result1 = [...numstomix].sort(() => Math.random() - 0.5);
                const ChosenNumber = firstNumber.value
                const MoneyBet = secondNumber.value
                
                // Display numbers rapidly like a slot machine
                async function displayNumbers() {
                    for (let i = 0; i < result1.length; i++) {
                        const item1 = result1[i];
                        ResultArea.textContent = `${item1}`;
                        await sleep(50);
                    }
                }

                // Validate bet before allowing gambling
                if (MoneyBet <= CalcBuxAmount && MoneyBet > 0 && ChosenNumber <= 9 && ChosenNumber >= 0) {
                    CalcBuxAmount -= MoneyBet
                    displayNumbers()
                    // Check if player wins after animation
                    setTimeout(() => {
                        if (Number(ChosenNumber) == ResultArea.textContent) {
                            ResultArea.textContent = "Winner!"
                            CalcBuxAmount += MoneyBet * 2
                            CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
                        } else {
                            ResultArea.textContent = "Loser!"
                        }
                    }, 900);
                } else if (MoneyBet > CalcBuxAmount) {
                    ResultArea.textContent = "Not Enough Money!"
                } else if (ChosenNumber > 9 || ChosenNumber <= 0) {
                    ResultArea.textContent = "Invalid Number!"
                } else if (MoneyBet < 0) {
                    ResultArea.textContent = "You Can't Bet That Amount Of Money!"
                }
            }
        }

        // Add calculation to history and award money
        console.log(Results)
        AddCalcBux()
        saveGame()
        Results.push(firstNumber.value + operator + secondNumber.value)
        // Keep only last 5 calculations in history
        if (Results.length > 5) {
            Results.shift()
        }
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        // Reset debounce after animation completes
        setTimeout(() => {
            CalcDebounce = false
            CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        }, 500);
    }
    
});

// ============================================
// UPGRADE SYSTEM
// ============================================
const GamblePurchaseButton = document.getElementById("GamblePurchaseButton");
const CloseUpgradesButton = document.getElementById("CloseUpgradesButton");
const UpgradesArea = document.getElementById("UpgradesArea")
const GamblingButton = document.getElementById("GamblingButton")
const MoneyPurchaseButton = document.getElementById("MoneyPurchaseButton")
    
// Gambling upgrade purchase (costs 100 CalcBux)
GamblePurchaseButton.addEventListener("click", function() {
    if (CalcBuxAmount >= 100) {
        GamblePurchaseButton.disabled = true;
        GamblePurchaseButton.textContent = "Purchased!"
        GamblingButton.disabled = false
        EnabledUpgrades.push("Gambling")
        CalcBuxAmount -= 100
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        setTimeout(() => {
            GamblePurchaseButton.textContent = "GAMBLING: 100 CALCBUX"
        }, 900);
    } else {
        GamblePurchaseButton.textContent = "Not Enough Money!"
        GamblePurchaseButton.disabled = true
        setTimeout(() => {
            GamblePurchaseButton.textContent = "GAMBLING: 100 CALCBUX"
            GamblePurchaseButton.disabled = false
        }, 900);
    }
});

// Money multiplier upgrade purchase (costs 200 CalcBux, doubles earnings)
MoneyPurchaseButton.addEventListener("click", function() {
    if (CalcBuxAmount >= 200) {
        MoneyPurchaseButton.disabled = true;
        MoneyPurchaseButton.textContent = "Purchased!"
        EnabledUpgrades.push("2XMoreMoney")
        CalcBuxAmount -= 200
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        setTimeout(() => {
            MoneyPurchaseButton.textContent = "2X MORE MONEY: 200 CALCBUX"
        }, 900);
    } else {
        MoneyPurchaseButton.textContent = "Not Enough Money!"
        MoneyPurchaseButton.disabled = true
        setTimeout(() => {
            MoneyPurchaseButton.textContent = "2X MORE MONEY: 200 CALCBUX"
            MoneyPurchaseButton.disabled = false
        }, 900);
    }
});

// Close upgrades menu
CloseUpgradesButton.addEventListener("click", function() {
    UpgradesArea.style.visibility = "hidden"
});

// Open upgrades menu
UpgradeButton.addEventListener("click", function() {
    UpgradesArea.style.visibility = "visible"
});

// ============================================
// SAVE/LOAD INITIALIZATION
// ============================================
// Immediately-invoked function expression (IIFE) to load saved game on page load
(function initSave() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;

    try {
        applySaveData(JSON.parse(raw));

    } catch {
        console.warn("Save load failed :(")
    }
})();

// Auto-save game before leaving page
window.addEventListener("beforeunload", () => {
        saveGame()
});

// ============================================
// SETTINGS MENU
// ============================================
const SettingsButton = document.getElementById("SettingsButton");
const CloseSettingsButton = document.getElementById("CloseSettingsButton");
const DarkModeButton = document.getElementById("DarkModeButton");

// Open settings overlay
SettingsButton.addEventListener("click", function() {
    const SettingsOverlay = document.getElementById("SettingsOverlay");
    SettingsOverlay.style.visibility = "visible"
});

// Close settings overlay
CloseSettingsButton.addEventListener("click", function() {
    const SettingsOverlay = document.getElementById("SettingsOverlay");
    SettingsOverlay.style.visibility = "hidden"
});

// Toggle dark mode - switches all CSS color variables
DarkModeButton.addEventListener("click", function() {
    if (Body.style.backgroundColor === "var(--main-bg-color)") {
        // Switch to dark theme
        Body.style.backgroundColor = "#121212";
        Body.style.setProperty("--main-bg-color", "#121212");
        Body.style.setProperty("--main-border-color", "#3d3d3d");
        Body.style.setProperty("--button-bg-color", "#1e1e1e");
        Body.style.setProperty("--text-color", "white");
        Body.style.setProperty("--button-unavailable-color", "#2c2c2c");
        DarkModeButton.textContent = "LIGHT MODE"
    } else {
        // Switch to light theme
        Body.style.backgroundColor = "var(--main-bg-color)";
        Body.style.setProperty("--main-bg-color", "white");
        Body.style.setProperty("--main-border-color", "lightgray");
        Body.style.setProperty("--button-bg-color", "white");
        Body.style.setProperty("--text-color", "black");
        Body.style.setProperty("--button-unavailable-color", "lightgray");
        DarkModeButton.textContent = "DARK MODE"
    }
});

// ============================================
// SPLASH TEXT EASTER EGG
// ============================================
const SplashTextButton = document.getElementById("SplashTextButton");
const SplashText = document.getElementById("splashText");
let SplashTextEnabled = false;
SplashText.style.visibility = "hidden"

// ============================================
// AD SPAM EASTER EGG SYSTEM
// ============================================
// Creates 10 ads with random animation and positioning
function LoadAds() {
    if (AdsEnabled) {
        AdMiniGameButton.textContent = "Good Luck Cleaning this up :)"
        AdMiniGameButton.disabled = true;
        let adsOpen = 0; // Track total ads created
        
        for (let i = 0; i < 10; i++) {
            const Body = document.body;

            // Shortened array of fake ads (4 variations for spam effect)
            const ads = [
                {
                    text: "Buy Epic Calc Pro for only $9.99!!!",
                    style: {
                        backgroundColor: "white",
                        color: "black",
                        fontSize: "20px",
                        fontFamily: "Impact, sans-serif",
                        padding: "10px 30px 10px 10px",
                        border: "3px solid black",
                        transform: "rotate(-5deg)",
                        position: "fixed",
                        animation: "RainbowAnim 5s infinite",
                    }
                },
                {
                    text: "Hot Singles In Your Area!",
                    style: {
                        backgroundColor: "#ff7f7f",
                        color: "white",
                        fontSize: "18px",
                        fontFamily: "Comic Sans MS, cursive",
                        padding: "8px 30px 8px 8px",
                        border: "2px dashed darkred",
                        transform: "rotate(8deg)",
                        position: "fixed"
                    }
                },
                {
                    text: "Earn $5000 A Day From Home!!!",
                    style: {
                        backgroundColor: "#ffff7f",
                        color: "black",
                        fontSize: "24px",
                        fontFamily: "Impact, sans-serif",
                        padding: "14px 30px 14px 14px",
                        border: "5px double orange",
                        transform: "rotate(-7deg)",
                        position: "fixed"
                    }
                },
                {
                    text: "This One Weird Trick Will Make You Rich!!!",
                    style: {
                        backgroundColor: "#ff7fff",
                        color: "white",
                        fontSize: "18px",
                        fontFamily: "Comic Sans MS, cursive",
                        padding: "8px 30px 8px 8px",
                        border: "2px dashed purple",
                        transform: "rotate(10deg)",
                        position: "fixed"
                    }
                },
                {
                    text: "Doctors Hate Him! Find Out Why!!!",
                    style: {
                        backgroundColor: "#7fffff",
                        color: "black",
                        fontSize: "20px",
                        fontFamily: "Arial Black, Gadget, sans-serif",
                        padding: "10px 30px 10px 10px",
                        border: "3px solid cyan",
                        transform: "rotate(-5deg)",
                        position: "fixed"
                    }
                }
            ];

            // Create and display each ad with random positioning and rotation
            ads.forEach(adInfo => {
                const ad = document.createElement("div");
                ad.textContent = adInfo.text;
                adsOpen++; // Increment ad count

                // Random position on screen
                ad.style.top = Math.random() * (window.innerHeight - 50) + "px";
                ad.style.left = Math.random() * (window.innerWidth - 200) + "px";
                ad.style.zIndex = 1000;

                // Apply ad styling
                Object.assign(ad.style, adInfo.style);

                // Create close button for each ad
                const closeBtn = document.createElement("span");
                const randomRotation = Math.random() * 30 - 15;
                ad.style.transform = `rotate(${randomRotation}deg)`;
                closeBtn.textContent = "X";
                closeBtn.style.position = "absolute";
                closeBtn.style.top = "2px";
                closeBtn.style.right = "5px";
                closeBtn.style.cursor = "pointer";
                closeBtn.style.fontWeight = "bold";
                closeBtn.style.fontSize = "30px";
                closeBtn.style.color = ad.style.color;
                closeBtn.addEventListener("click", () => {
                    ad.remove();
                    adsOpen--; // Decrement when ad is closed
                    if (adsOpen === 0) {
                        onAllAdsClosed(); // Call when all ads closed
                    }
                });

                ad.style.position = "fixed";
                ad.style.display = "inline-block";
                ad.style.boxSizing = "border-box";

                ad.appendChild(closeBtn);
                Body.appendChild(ad);
            });

        }
    }
}

// Callback when all ads have been closed
function onAllAdsClosed() {
    console.log("All ads have been closed!");
    AdsEnabled = false
    saveGame()
}

// ============================================
// SPLASH TEXT SYSTEM
// ============================================
// Toggle splash text visibility
SplashTextButton.addEventListener("click", function() {
    if (!SplashTextEnabled) {
        SplashText.style.visibility = "visible"
        SplashTextEnabled = true;
        changeSplashText();
        SplashTextButton.textContent = "HIDE SPLASH TEXT"
    } else {
        SplashText.style.visibility = "hidden"
        SplashTextEnabled = false;
        SplashTextButton.textContent = "SPLASH TEXT (buggy)"
    }
});

// ============================================
// AD EASTER EGG BUTTON
// ============================================
// Progressive button messages that trigger ad spam after 4 clicks
let ButtonRageLevel = 0;
const AdMiniGameButton = document.getElementById("AdMiniGameButton");
AdMiniGameButton.addEventListener("click", function() {
    if (ButtonRageLevel == 0) {
        AdMiniGameButton.textContent = "Dont."
    } else if (ButtonRageLevel == 1) {
        AdMiniGameButton.textContent = "Seriously, stop."
    } else if (ButtonRageLevel == 2) {
        AdMiniGameButton.textContent = "I said stop!"
    } else if (ButtonRageLevel == 3) {
        AdMiniGameButton.textContent = "Last warning!"
    } else if (ButtonRageLevel >= 4) {
        AdsEnabled = true;
        LoadAds()
        saveGame()
    }
    ButtonRageLevel += 1;
});

// ============================================
// SHOP & LOOT BOX SYSTEM
// ============================================
const ShopButton = document.getElementById("ShopButton");
const ShopOverlay = document.getElementById("ShopOverlay");
const CloseShopButton = document.getElementById("CloseShopButton");

// Open shop overlay
ShopButton.addEventListener("click", function() {
    ShopOverlay.style.visibility = "visible"
});

// Close shop overlay
CloseShopButton.addEventListener("click", function() {
    ShopOverlay.style.visibility = "hidden"
});

// Loot box rolling animation and reward distribution
function Roll() {
    const LootBoxOverlay = document.getElementById("LootBoxOverlay");
    const LootBoxImage = document.getElementById("LootBoxImage");
    const LootBoxTitle = document.getElementById("LootBoxTitle");
    const LootBoxSubtitle = document.getElementById("LootBoxSubtitle");

    LootBoxOverlay.style.visibility = "visible"
    ShopOverlay.style.visibility = "hidden"

    // MONEY LOOT BOX - Random CalcBux rewards // Haha I nerfed it, FUCK YOU!!!
    if (SelectedLootBox === "Money") {
        let rewards = ["10 Calcbux", "20 CalcBux", "50 CalcBux", "70 CalcBux", "100 CalcBux", "200 CalcBux", "1 CalcBux"]
        rewards.sort(() => Math.random() - 0.5)
        let finalReward = rewards[rewards.length - 1];
        
        // Animate through rewards with different messages
        rewards.forEach((reward, index) => {
            setTimeout(() => {
                LootBoxTitle.textContent = reward;
                if (reward == "10 Calcbux") {
                    LootBoxSubtitle.textContent = "10 Calcbux, gg's bro";
                    LootBoxImage.textContent = "$";
                } else if (reward == "20 CalcBux") {
                    LootBoxSubtitle.textContent = "20 CalcBux, NO REFUNDS!";
                    LootBoxImage.textContent = "$$";
                } else if (reward == "50 CalcBux") {
                    LootBoxSubtitle.textContent = "50 CalcBux, retry?";
                    LootBoxImage.textContent = "$$$";
                } else if (reward == "70 CalcBux") {
                    LootBoxSubtitle.textContent = "70 CalcBux, getting better?";
                    LootBoxImage.textContent = "$$$$";
                } else if (reward == "100 CalcBux") {
                    LootBoxSubtitle.textContent = "100 CalcBux, cool ig?";
                    LootBoxImage.textContent = "$$$$$";
                } else if (reward == "200 CalcBux") {
                    LootBoxSubtitle.textContent = "200 CalcBux, alr bro pack it up";
                    LootBoxImage.textContent = "$$$$$$";
                } else if (reward == "1 CalcBux") {
                    LootBoxSubtitle.textContent = "1 CalcBux, son";
                    LootBoxImage.textContent = ":(";
                }
            }, index * 100);
        });
        
        // Award money and close box after animation
        setTimeout(() => {
            let amount = parseInt(finalReward.replace(/[^\d]/g, ''));
            CalcBuxAmount += amount;
            CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
            LootBoxOverlay.style.visibility = "hidden"
            ShopOverlay.style.visibility = "visible"
        }, rewards.length * 200);
    }

    // SKIN LOOT BOX - Random skin rewards
    if (SelectedLootBox === "Skin") {
        let rewards = ["Generic Neon", "Girly Pastel", "EVIL RED", "Golden Prestige", "Cosmic Void", "Terminal Green", "BLOOD MOON", "Rainbow"]
        rewards.sort(() => Math.random() - 0.5)
        let finalReward = rewards[rewards.length - 1];
        
        // Animate through skin rewards with emojis and descriptions
        rewards.forEach((reward, index) => {
            setTimeout(() => {
                LootBoxTitle.textContent = reward;
                if (reward == "Generic Neon") {
                    LootBoxSubtitle.textContent = "A generic neon skin, how original.";
                    LootBoxImage.textContent = "🟩";
                } else if (reward == "Girly Pastel") {
                    LootBoxSubtitle.textContent = "A girly pastel skin, how cute!";
                    LootBoxImage.textContent = "🟪";
                } else if (reward == "EVIL RED") {
                    LootBoxSubtitle.textContent = "An evil red skin, how scary!";
                    LootBoxImage.textContent = "🟥";
                } else if (reward == "Golden Prestige") {
                    LootBoxSubtitle.textContent = "A golden prestige skin, how fancy!";
                    LootBoxImage.textContent = "🟨";
                } else if (reward == "Cosmic Void") {
                    LootBoxSubtitle.textContent = "A cosmic void skin, how mysterious!";
                    LootBoxImage.textContent = "⬛";
                } else if (reward == "Terminal Green") {
                    LootBoxSubtitle.textContent = "A terminal green skin, how techy!";
                    LootBoxImage.textContent = "🟩";
                } else if (reward == "BLOOD MOON") {
                    LootBoxSubtitle.textContent = "A blood moon skin, how spooky!";
                    LootBoxImage.textContent = "🟥";
                } else if (reward == "Rainbow") {
                    LootBoxSubtitle.textContent = "A rainbow skin, how colorful!";
                    LootBoxImage.textContent = "🌈";
                }
            }, index * 100);
        });
        
        // Add new skin to collection and refresh UI
        setTimeout(() => {
            if (!UnlockedSkins.includes(finalReward)) {
                UnlockedSkins.push(finalReward)
                saveGame()
            }
            LootBoxOverlay.style.visibility = "hidden"
            ShopOverlay.style.visibility = "visible"
            console.log(UnlockedSkins)
            RefreshSkins();
        }, rewards.length * 200);
    }
}

// SETTINGS PANEL - Reset confirmation button
const ResetSaveDataButton = document.getElementById("ResetSaveDataButton");
let ResetButtonStage = 0;
ResetSaveDataButton.addEventListener("click", function() {
    if (ResetButtonStage == 0) {
        ResetSaveDataButton.textContent = "ARE YOU SURE?"
        ResetButtonStage = 1;
    } else if (ResetButtonStage == 1) {
        ResetSaveDataButton.textContent = "LAST CHANCE!"
        ResetButtonStage = 2;
    } else if (ResetButtonStage >= 2) {
        resetCalculator()
        ResetSaveDataButton.textContent = "REFRESH FOR CHANGES TO TAKE EFFECT"
    }
});

// ============================================
// LOOT BOX PURCHASE HANDLERS
// ============================================
let SelectedLootBox = null;
const CommonLootBox = document.getElementById("CommonLootBox");
const SkinLootBox = document.getElementById("SkinLootBox");

// Common loot box - 50 CalcBux for random money reward
CommonLootBox.addEventListener("click", function() {
    if (CalcBuxAmount >= 50) {
        CalcBuxAmount -= 50;
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        SelectedLootBox = "Money";
        Roll()
    }
});

// Skin loot box - 100 CalcBux for random skin reward
SkinLootBox.addEventListener("click", function() {
    if (CalcBuxAmount >= 100) {
        CalcBuxAmount -= 100;
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        SelectedLootBox = "Skin";
        Roll()
    }
});

// ============================================
// SKIN SELECTION & APPLICATION
// ============================================
const SkinsButton = document.getElementById("SkinsButton");
const SkinsOverlay = document.getElementById("SkinsOverlay");

// Open skins menu
SkinsButton.addEventListener("click", function() {
    SkinsOverlay.style.visibility = "visible"
});

const CloseSkinsButton = document.getElementById("CloseSkinsButton");

// Close skins menu
CloseSkinsButton.addEventListener("click", function() {
    SkinsOverlay.style.visibility = "hidden"
});

// All skin selection buttons
const NoSkinButton = document.getElementById("NoSkinButton");
const GenericNeonButton = document.getElementById("GenericNeonButton");
const GirlyPastelButton = document.getElementById("GirlyPastelButton");
const EVILREDBUTTON = document.getElementById("EVILREDBUTTON");
const GoldenPrestigeButton = document.getElementById("GoldenPrestigeButton");
const CosmicVoidButton = document.getElementById("CosmicVoidButton");
const TerminalGreenButton = document.getElementById("TerminalGreenButton");
const BloodMoonButton = document.getElementById("BloodMoonButton");
const RainbowButton = document.getElementById("RainbowButton");

// Enable/disable skin buttons based on what's unlocked
function RefreshSkins() {
    // ===== SKIN UNLOCK CHECKING =====
    // Check each skin and enable/disable button accordingly
    if (UnlockedSkins.includes("Generic Neon")) {
        GenericNeonButton.disabled = false;
    } else {
        GenericNeonButton.disabled = true;
    }
    if (UnlockedSkins.includes("Girly Pastel")) {
        GirlyPastelButton.disabled = false;
    } else {
        GirlyPastelButton.disabled = true;
    }
    if (UnlockedSkins.includes("EVIL RED")) {
        EVILREDBUTTON.disabled = false;
    } else {
        EVILREDBUTTON.disabled = true;
    }
    if (UnlockedSkins.includes("Golden Prestige")) {
        GoldenPrestigeButton.disabled = false;
    } else {
        GoldenPrestigeButton.disabled = true;
    }
    if (UnlockedSkins.includes("Cosmic Void")) {
        CosmicVoidButton.disabled = false;
    } else {
        CosmicVoidButton.disabled = true;
    }
    if (UnlockedSkins.includes("Terminal Green")) {
        TerminalGreenButton.disabled = false;
    } else {
        TerminalGreenButton.disabled = true;
    }
    if (UnlockedSkins.includes("BLOOD MOON")) {
        BloodMoonButton.disabled = false;
    } else {
        BloodMoonButton.disabled = true;
    }
    if (UnlockedSkins.includes("Rainbow")) {
        RainbowButton.disabled = false;
    } else {
        RainbowButton.disabled = true;
    }

    // ===== NO SKIN THEME =====
    // Default white background with spinning operator symbol
    if (SelectedSkin == "No Skin") {
        NoSkinButton.textContent = "SELECTED"
        NoSkinButton.style.color = "lime";

        Body.style.backgroundColor = "var(--main-bg-color)";
        Body.style.setProperty("--main-bg-color", "white");
        Body.style.setProperty("--main-border-color", "lightgray");
        Body.style.setProperty("--button-bg-color", "white");
        Body.style.setProperty("--text-color", "black");
        Body.style.setProperty("--button-unavailable-color", "lightgray");
        DarkModeButton.textContent = "DARK MODE"
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";

    } else {
        NoSkinButton.textContent = "SELECT"
        NoSkinButton.style.color = "var(--text-color)";
    }

    // ===== GENERIC NEON THEME =====
    // Lime green on black with animated title letters
    if (SelectedSkin == "Generic Neon") {
        GenericNeonButton.textContent = "SELECTED"
        GenericNeonButton.style.color = "lime";

        Body.style.backgroundColor = "#121212";
        Body.style.setProperty("--main-bg-color", "#121212");
        Body.style.setProperty("--main-border-color", "lime");
        Body.style.setProperty("--button-bg-color", "#1e1e1e");
        Body.style.setProperty("--text-color", "lime");
        Body.style.setProperty("--button-unavailable-color", "green");
        
        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim";
            span.style.animationDuration = "2s";
            span.style.animationIterationCount = "infinite";
            span.style.animationTimingFunction = "ease-in-out";
            span.style.animationDirection = "normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "lime";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";
    } else {
        GenericNeonButton.textContent = "SELECT"
        GenericNeonButton.style.color = "var(--text-color)";
    }

    // ===== GIRLY PASTEL THEME =====
    // Pink pastels with sweet aesthetic
    if (SelectedSkin == "Girly Pastel") {
        GirlyPastelButton.textContent = "SELECTED"
        GirlyPastelButton.style.color = "lime";
        
        Body.style.backgroundColor = "#FFD6E8";
        Body.style.setProperty("--main-bg-color", "#FFD6E8");
        Body.style.setProperty("--main-border-color", "#f5a4c2");
        Body.style.setProperty("--button-bg-color", "#FFAEC0");
        Body.style.setProperty("--text-color", "#5B3A4D");
        Body.style.setProperty("--button-unavailable-color", "#f5a4c2");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim";
            span.style.animationDuration = "2s";
            span.style.animationIterationCount = "infinite";
            span.style.animationTimingFunction = "ease-in-out";
            span.style.animationDirection = "normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "#5B3A4D";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";
    } else {
        GirlyPastelButton.textContent = "SELECT"
        GirlyPastelButton.style.color = "var(--text-color)";
    }

    // ===== EVIL RED THEME =====
    // Dark red with shaking animations for ominous feel
    if (SelectedSkin == "EVIL RED") {
        EVILREDBUTTON.textContent = "SELECTED"
        EVILREDBUTTON.style.color = "lime";

        Body.style.backgroundColor = "#1a0202";
        Body.style.setProperty("--main-bg-color", "#290404");
        Body.style.setProperty("--main-border-color", "red");
        Body.style.setProperty("--button-bg-color", "#290404");
        Body.style.setProperty("--text-color", "red");
        Body.style.setProperty("--button-unavailable-color", "#400a0a");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "shake 0.6s infinite ease-in-out";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "red";
        });
        Operator.style.animation = "shake 0.6s infinite ease-in-out";
    } else {
        EVILREDBUTTON.textContent = "SELECT"
        EVILREDBUTTON.style.color = "var(--text-color)";
    }

    // ===== GOLDEN PRESTIGE THEME =====
    // Gold and brown colors with elegant animations
    if (SelectedSkin == "Golden Prestige") {
        GoldenPrestigeButton.textContent = "SELECTED"
        GoldenPrestigeButton.style.color = "lime";
        
        Body.style.backgroundColor = "#B08D2C";
        Body.style.setProperty("--main-bg-color", "#B08D2C");
        Body.style.setProperty("--main-border-color", "#9A7A24");
        Body.style.setProperty("--button-bg-color", "#6E5618");
        Body.style.setProperty("--text-color", "#F3E6B1");
        Body.style.setProperty("--button-unavailable-color", "#7A6A3A");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim";
            span.style.animationDuration = "2s";
            span.style.animationIterationCount = "infinite";
            span.style.animationTimingFunction = "ease-in-out";
            span.style.animationDirection = "normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "gold";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";
    } else {
        GoldenPrestigeButton.textContent = "SELECT"
        GoldenPrestigeButton.style.color = "var(--text-color)";
    }

    // ===== COSMIC VOID THEME =====
    // Deep purple with ethereal animations
    if (SelectedSkin == "Cosmic Void") {
        CosmicVoidButton.textContent = "SELECTED"
        CosmicVoidButton.style.color = "lime";

        Body.style.backgroundColor = "#1B0B2A";
        Body.style.setProperty("--main-bg-color", "#1B0B2A");
        Body.style.setProperty("--main-border-color", "#3A1F4B");
        Body.style.setProperty("--button-bg-color", "#4B2B6E");
        Body.style.setProperty("--text-color", "#E0D6F0");
        Body.style.setProperty("--button-unavailable-color", "#2E1A3B");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim";
            span.style.animationDuration = "2s";
            span.style.animationIterationCount = "infinite";
            span.style.animationTimingFunction = "ease-in-out";
            span.style.animationDirection = "normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "#E0D6F0";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";

    } else {
        CosmicVoidButton.textContent = "SELECT"
        CosmicVoidButton.style.color = "var(--text-color)";
    }

    // ===== TERMINAL GREEN THEME =====
    // Classic hacker terminal green on black with flicker effect
    if (SelectedSkin == "Terminal Green") {
        TerminalGreenButton.textContent = "SELECTED"
        TerminalGreenButton.style.color = "lime";

        Body.style.backgroundColor = "#000000";
        Body.style.setProperty("--main-bg-color", "#000000");
        Body.style.setProperty("--main-border-color", "lime");
        Body.style.setProperty("--button-bg-color", "#00000");
        Body.style.setProperty("--text-color", "lime");
        Body.style.setProperty("--button-unavailable-color", "#6C8F00");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim, blood-moon-flicker";
            span.style.animationDuration = "2s, 0.5s";
            span.style.animationIterationCount = "infinite, infinite";
            span.style.animationTimingFunction = "ease-in-out, ease-in-out";
            span.style.animationDirection = "normal, normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "lime";
        });

    } else {
        TerminalGreenButton.textContent = "SELECT"
        TerminalGreenButton.style.color = "var(--text-color)";
    }

    // ===== BLOOD MOON THEME =====
    // Dark red with blood moon animations for spooky aesthetic
    if (SelectedSkin == "BLOOD MOON") {
        BloodMoonButton.textContent = "SELECTED"
        BloodMoonButton.style.color = "lime";

        Body.style.backgroundColor = "#000000";
        Body.style.setProperty("--main-bg-color", "#000000");
        Body.style.setProperty("--main-border-color", "#3A0B0B");
        Body.style.setProperty("--button-bg-color", "#4C0E0E");
        Body.style.setProperty("--text-color", "#E58B8B");
        Body.style.setProperty("--button-unavailable-color", "#1F0505");

        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "TitleAnim, blood-moon-flicker";
            span.style.animationDuration = "2s, 3.5s";
            span.style.animationIterationCount = "infinite, infinite";
            span.style.animationTimingFunction = "ease-in-out, ease-in-out";
            span.style.animationDirection = "normal, normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "red";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";

    } else {
        BloodMoonButton.textContent = "SELECT"
        BloodMoonButton.style.color = "var(--text-color)";
    }

    // ===== RAINBOW THEME =====
    // Rainbow animation with rickroll easter egg
    if (SelectedSkin == "Rainbow") {
        RainbowButton.textContent = "SELECTED"
        RainbowButton.style.color = "lime";

        // Easter egg: opens rickroll video when selected
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
        Body.style.backgroundColor = "var(--main-bg-color)";
        Body.style.setProperty("--main-bg-color", "white");
        Body.style.setProperty("--main-border-color", "lightgray");
        Body.style.setProperty("--button-bg-color", "white");
        Body.style.setProperty("--text-color", "black");
        Body.style.setProperty("--button-unavailable-color", "lightgray");
        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "RainbowAnim, TitleAnim";
            span.style.animationDuration = "3s, 1.6s";
            span.style.animationIterationCount = "infinite, infinite";
            span.style.animationTimingFunction = "ease-in-out, ease-in-out";
            span.style.animationDirection = "normal, normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "black";
        });
        Operator.style.animation = "OperatorSpin 0.9s infinite ease-in-out alternate";
    } else {
        RainbowButton.textContent = "SELECT"
        RainbowButton.style.color = "var(--text-color)";
    }

    // Dark/Light mode toggle unavailable when custom skin selected
    if (SelectedSkin != "No Skin") {
        DarkModeButton.disabled = true;
        DarkModeButton.textContent = "Dark & Light Mode Unavailable"
    }
    if (SelectedSkin == "No Skin") {
        DarkModeButton.disabled = false;
        Title.querySelectorAll(".word span").forEach(span => {
            span.style.animation = "none"
            span.style.animationName = "RainbowAnim, TitleAnim";
            span.style.animationDuration = "3s, 1.6s";
            span.style.animationIterationCount = "infinite, infinite";
            span.style.animationTimingFunction = "ease-in-out, ease-in-out";
            span.style.animationDirection = "normal, normal";
            span.style.animationDelay = "calc(0.08s * var(--i))";
            span.style.color = "black";
        });
    }
}

// ===== SKIN BUTTON EVENT LISTENERS =====
// Select "No Skin" - default theme
NoSkinButton.addEventListener("click", function() {
    SelectedSkin = "No Skin";
    saveGame()
    RefreshSkins();
});

// Select "Generic Neon" - lime green hacker aesthetic
GenericNeonButton.addEventListener("click", function() {
    SelectedSkin = "Generic Neon";
    saveGame()
    RefreshSkins();
});

// Select "Girly Pastel" - pink pastel sweet aesthetic
GirlyPastelButton.addEventListener("click", function() {
    SelectedSkin = "Girly Pastel";
    saveGame()
    RefreshSkins();
});

// Select "EVIL RED" - dark red spooky theme
EVILREDBUTTON.addEventListener("click", function() {
    SelectedSkin = "EVIL RED";
    saveGame()
    RefreshSkins();
});

// Select "Golden Prestige" - gold and brown elegant theme
GoldenPrestigeButton.addEventListener("click", function() {
    SelectedSkin = "Golden Prestige";
    saveGame()
    RefreshSkins();
});

// Select "Cosmic Void" - deep purple ethereal theme
CosmicVoidButton.addEventListener("click", function() {
    SelectedSkin = "Cosmic Void";
    saveGame()
    RefreshSkins();
});

// Select "Terminal Green" - hacker terminal theme
TerminalGreenButton.addEventListener("click", function() {
    SelectedSkin = "Terminal Green";
    saveGame()
    RefreshSkins();
});

// Select "BLOOD MOON" - dark red spooky glitchy theme
BloodMoonButton.addEventListener("click", function() {
    SelectedSkin = "BLOOD MOON";
    saveGame()
    RefreshSkins();
});

// Select "Rainbow" - rainbow animation with rickroll easter egg
RainbowButton.addEventListener("click", function() {
    SelectedSkin = "Rainbow";
    saveGame()
    RefreshSkins();
});

// ============================================
// SPLASH TEXT DISPLAY SYSTEM
// ============================================
const splashText = document.getElementById("splashText");

// Array of splash text messages (Minecraft-inspired hints)
const splashTexts = [
    "The best calculator in the world!", 
    "Now with loot boxes!", 
    "Gambling? Yes please!",
    "Make sure to pay the IRS!",
    "Ad spam is love, ad spam is life.",
    "Press the buttons, get rewards!",
    "Don't forget to check the bank for interest!",
    "Customize your calculator with skins!",
    "Earn CalcBux and spend them in the shop!",
    "Close the ads for a surprise!",
    "Thank you for using The Epic Calculator!",
    "This calculator is so epic, it has its own bank!",
];

// Display random splash text message
function changeSplashText() {
    const randomIndex = Math.floor(Math.random() * splashTexts.length);
    splashText.textContent = splashTexts[randomIndex];
}

changeSplashText();


// ============================================
// MAIN MENU
// ============================================

const MenuButton = document.getElementById("MenuButton");
const MenuOverlay = document.getElementById("MenuOverlay");
const CloseMenuButton = document.getElementById("CloseMenuButton");

MenuButton.addEventListener("click", function() {
    MenuOverlay.style.visibility = "visible"
});

CloseMenuButton.addEventListener("click", function() {
    MenuOverlay.style.visibility = "hidden"
});

// ============================================
// BANK SYSTEM
// ============================================

const BankButton = document.getElementById("BankButton");
const BankOverlay = document.getElementById("BankOverlay");
const CloseBankButton = document.getElementById("CloseBankButton");
const DepositMoneyButton = document.getElementById("DepositMoneyButton");
const WithdrawMoneyButton = document.getElementById("WithdrawMoneyButton");
const DepositMenuOverlay = document.getElementById("DepositMenuOverlay");
const WithdrawMenuOverlay = document.getElementById("WithdrawMenuOverlay");
const CloseDepositMenuButton = document.getElementById("CloseDepositMenuButton");
const CloseWithdrawMenuButton = document.getElementById("CloseWithdrawMenuButton");
const InterestButton = document.getElementById("InterestButton");
const InterestMessage = document.getElementById("InterestMessage");
const LoanButton = document.getElementById("LoanButton");
const LoanMenuOverlay = document.getElementById("LoanMenuOverlay");
const CloseLoanMenuButton = document.getElementById("CloseLoanMenuButton");
const LoanAmountInput = document.getElementById("LoanAmountInput")
const LoanAmountDisplay = document.getElementById("LoanAmountDisplay")
const ConfirmLoanButton = document.getElementById("ConfirmLoanButton")

// INTEREST SYSTEM - Earn 5% interest on account balance every time button is clicked (assuming t=1 for simple interest)

InterestButton.addEventListener("click", function() {
    if (InterestAvailable == false) {
        InterestMessage.textContent = "Interest already claimed! Come back later. :D"
        return;
    }
    // Define your rate (5%)
    const interestRate = 0.05; 
    
    // Calculate: Simple Interest = Principal * Rate
    const interestEarned = Math.floor(AccountBalance * interestRate);

    if (interestEarned > 0) {
        AccountBalance += interestEarned;
        InterestAvailable = false
        
        // Update UI
        BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`;
        InterestMessage.textContent = `You earned ${interestEarned} CalcBux in interest!`;
        
        saveGame();
    } else {
        InterestMessage.textContent = "Your balance is too low to earn interest!";
    }
});
const BalanceDisplay = document.getElementById("BalanceDisplay");

BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`

// Menu Toggling

BankButton.addEventListener("click", function() {
    BankOverlay.style.visibility = "visible"
});

CloseBankButton.addEventListener("click", function() {
    BankOverlay.style.visibility = "hidden"
});

DepositMoneyButton.addEventListener("click", function() {
    DepositMenuOverlay.style.visibility = "visible"
    BankOverlay.style.visibility = "hidden"
});

WithdrawMoneyButton.addEventListener("click", function() {
    WithdrawMenuOverlay.style.visibility = "visible"
    BankOverlay.style.visibility = "hidden"
});


CloseDepositMenuButton.addEventListener("click", function() {
    DepositMenuOverlay.style.visibility = "hidden"
    BankOverlay.style.visibility = "visible"
});

CloseWithdrawMenuButton.addEventListener("click", function() {
    WithdrawMenuOverlay.style.visibility = "hidden"
    BankOverlay.style.visibility = "visible"
    
});

CloseLoanMenuButton.addEventListener("click", function() {
    LoanMenuOverlay.style.visibility = "hidden"
    BankOverlay.style.visibility = "visible"
});

LoanButton.addEventListener("click", function() {
    LoanMenuOverlay.style.visibility = "visible"
    BankOverlay.style.visibility = "hidden"
});


// Deposit Menu And System

const DepositAmountInput = document.getElementById("DepositAmountInput");
const ConfirmDepositButton = document.getElementById("ConfirmDepositButton");
const DepositAmountDisplay = document.getElementById("DepositAmountDisplay");

DepositAmountInput.addEventListener("input", function() {
    DepositAmountDisplay.textContent = `Account Balance After Depositing: ${Number(DepositAmountInput.value) + AccountBalance} CalcBux`
});

ConfirmDepositButton.addEventListener("click", function() {
    let DepositAmount = Number(DepositAmountInput.value);
    if (DepositAmount > CalcBuxAmount) {
        DepositAmountDisplay.textContent = "You dont have that much CalcBux to deposit!"
    } else if (DepositAmount <= 0) {
        DepositAmountDisplay.textContent = "Deposit amount must be greater than 0!"
    } else {
        CalcBuxAmount -= DepositAmount;
        AccountBalance += DepositAmount;
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`
        DepositAmountDisplay.textContent = "Deposit successful!"
        saveGame()
        setTimeout(() => {
            DepositAmountDisplay.textContent = `Account Balance After Depositing: ${Number(DepositAmountInput.value) + AccountBalance} CalcBux`
        }, 500);
    }
});

// Withdraw Menu And System

const WithdrawAmountInput = document.getElementById("WithdrawAmountInput");
const ConfirmWithdrawButton = document.getElementById("ConfirmWithdrawButton");
const WithdrawAmountDisplay = document.getElementById("WithdrawAmountDisplay");

WithdrawAmountInput.addEventListener("input", function() {
    WithdrawAmountDisplay.textContent = `Account Balance After Withdrawing: ${AccountBalance - Number(WithdrawAmountInput.value)} CalcBux`
});

ConfirmWithdrawButton.addEventListener("click", function() {
    let WithdrawAmount = Number(WithdrawAmountInput.value);
    if (WithdrawAmount > AccountBalance) {
        WithdrawAmountDisplay.textContent = "You dont have that much CalcBux in your account to withdraw!"
    } else if (WithdrawAmount <= 0) {
        WithdrawAmountDisplay.textContent = "Withdraw amount must be greater than 0!"
    } else {
        CalcBuxAmount += WithdrawAmount;
        AccountBalance -= WithdrawAmount;
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`
        WithdrawAmountDisplay.textContent = "Withdrawal successful!"
        saveGame()
        setTimeout(() => {
            WithdrawAmountDisplay.textContent = `Account Balance After Withdrawing: ${AccountBalance - Number(WithdrawAmountInput.value)} CalcBux`
        }, 500);
    }
});

// Loan Menu And System

LoanAmountInput.addEventListener("input", function() {
    LoanAmountDisplay.textContent = `Account Balance After Loaning: ${Number(LoanAmountInput.value) + AccountBalance} CalcBux`
});


ConfirmLoanButton.addEventListener("click", function() {
    if (!LoanEnabled) {
        if (Number(LoanAmountInput.value) > 0) {
            console.log(Number(LoanAmountInput.value))
            MoneyOwed = Math.round(Number(LoanAmountInput.value) + Number(LoanAmountInput.value) / 5)
            AccountBalance += Number(LoanAmountInput.value)
            BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`
            LoanEnabled = true;
            ConfirmLoanButton.textContent = "Pay Back Loan"
            LoanAmountDisplay.textContent = `You Owe ${MoneyOwed} Calcbux! repay them before reloading or there will be consequences!`
        } else {
            LoanAmountDisplay.textContent = `You cant ask for ${Number(LoanAmountInput.value)} Calcbux, buddy.`
        }
    } else {
        if (AccountBalance >= MoneyOwed) {
            AccountBalance -= MoneyOwed
            LoanAmountDisplay.textContent = `Thank you for paying back your loan!`
            LoanEnabled = false;
        } else if (AccountBalance < MoneyOwed) {
            LoanAmountDisplay.textContent = `You don't have enough money to pay back your loan!`
        }
    }
});


// ============================================
// TAXES
// ============================================

const TaxesButton = document.getElementById("TaxesButton");
const TaxesOverlay = document.getElementById("TaxesOverlay");
const CloseTaxesButton = document.getElementById("CloseTaxesButton");
const TaxesAmountDisplay = document.getElementById("TaxesAmountDisplay");
const PayTaxesButton = document.getElementById("PayTaxesButton");
let TaxesPaid = false;

TaxesButton.addEventListener("click", function() {
    TaxesOverlay.style.display = "flex"
});

CloseTaxesButton.addEventListener("click", function() {
    TaxesOverlay.style.display = "none"
});

PayTaxesButton.addEventListener("click", function() {
    let TaxAmount = Math.floor((CalcBuxAmount + AccountBalance) * 0.1);
    if (CalcBuxAmount >= TaxAmount) {
        CalcBuxAmount -= TaxAmount;
        CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
        TaxesOverlay.style.display = "none"
        const MoneyOwe = document.getElementById("MoneyOwe");
        MoneyOwe.style.visibility = "hidden"
        PayTaxesButton.style.visibility = "hidden";
        TaxesPaid = true;
        saveGame()
    } else {
        const MoneyOwe = document.getElementById("MoneyOwe");
        MoneyOwe.textContent = "You dont have enough CalcBux to pay your taxes!"
    }
});

function RefreshTaxes() {
    let TaxAmount = Math.floor((CalcBuxAmount + AccountBalance) * 0.1);
    TaxesAmountDisplay.textContent = `${TaxAmount} CalcBux`
    const MoneyOwe = document.getElementById("MoneyOwe");
    MoneyOwe.style.visibility = "visible"
    MoneyOwe.textContent = "You Have Unpaid Taxes To Take Care Of! 0:20"
    MoneyOwe.style.animation = "RedPulse 1s infinite";
    PayTaxesButton.style.visibility = "visible";
    let TimeLeft = 20; // 20 Seconds
    const TimerInterval = setInterval(() => {
        TimeLeft--;
        let minutes = Math.floor(TimeLeft / 60);
        let seconds = TimeLeft % 60;
        if (
            TaxesPaid == true) {
            clearInterval(TimerInterval);
            return;
        }
        MoneyOwe.textContent = `You Have Unpaid Taxes To Take Care Of! ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (CalcBuxAmount == 0) {
            MoneyOwe.textContent = "Naw bro the irs dont want shit from you"
            setInterval(() => {
                MoneyOwe.style.animation = "FadeAway 1s forwards";
                setTimeout(() => {
                    MoneyOwe.style.visibility = "hidden"
                }, 500);
                return;
            }, 500);
        }
        if (TimeLeft <= 0) {
            clearInterval(TimerInterval);
            MoneyOwe.textContent = "You Didn't Pay Your Taxes! All Your Money Has Been Seized By The IRS!";
            CalcBuxAmount = 0;
            AccountBalance = 0;
            PayTaxesButton.style.visibility = "hidden"
            CalcBux.textContent = `CalcBux Amount: ${CalcBuxAmount}$`
            BalanceDisplay.textContent = `Account Balance: ${AccountBalance} CalcBux`
            setInterval(() => {
                MoneyOwe.style.animation = "FadeAway 1s forwards";
                setTimeout(() => {
                    MoneyOwe.style.visibility = "hidden"
                }, 1000);
                return;
            }, 3000);
        }
    }, 1000);
}

// ========================================
// GAME LOOPS
// ========================================

setInterval(() => {
    RefreshTaxes();
    InterestAvailable = true;
}, 300000); // Refresh tax amount every 5 minutes



if (LoanEnabled) {
    alert("You Refreshed, I told you not to. All your money has been taken, dont try this again.")
    AccountBalance = 0
    CalcBuxAmount = 0
    LoanEnabled = false
}



// ============================================
// INITIALIZATION - PAGE LOAD
// ============================================
// Refresh skin UI based on loaded/default state
RefreshSkins();
// Load ads if ad spam was previously enabled
LoadAds()
// Debug: log current game state
console.log(getSaveData())
// Loan System


// Fun message for developers opening the console
console.log("Hey you! Get the fuck out of my console! >:(")