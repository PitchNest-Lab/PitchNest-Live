@echo off
echo 🚀 Gathering all changes...
git add .

echo 📝 Committing with timestamp...
git commit -m "Auto-update: %date% %time%"

echo ☁️ Pushing to GitHub...
git push origin main

echo ✅ All changes successfully pushed to GitHub!