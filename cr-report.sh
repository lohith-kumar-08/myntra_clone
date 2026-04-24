#!/bin/bash
# CR Report Generator — uses GitHub REST API directly
# Usage: bash cr-report.sh <GITHUB_TOKEN>
# Example: bash cr-report.sh ghp_xxxxxxxxxxxx

REPO="lohith-kumar-08/myntra_clone"
TOKEN="${1:-$GITHUB_TOKEN}"
OUTPUT="cr-report-$(date +%Y-%m-%d).csv"

if [ -z "$TOKEN" ]; then
  echo "Error: GitHub token required."
  echo "Usage: bash cr-report.sh <GITHUB_TOKEN>"
  exit 1
fi

HEADERS='-H "Authorization: Bearer '"$TOKEN"'" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28"'

echo "Generating CR report for $REPO..."

# CSV Header
echo "CR_ID,Title,Status,Created_At,Approved_By,Approval_Date,PR,Commit_SHA,Merged_Date,Deployed_At,Deployment_Approved_By" > $OUTPUT

# Fetch all issues (paginated)
PAGE=1
ALL_ISSUES="[]"
while true; do
  RESPONSE=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/$REPO/issues?state=all&per_page=100&page=$PAGE")

  COUNT=$(echo "$RESPONSE" | jq 'length')
  if [ "$COUNT" -eq 0 ]; then break; fi

  ALL_ISSUES=$(echo "$ALL_ISSUES $RESPONSE" | jq -s 'add')
  PAGE=$((PAGE + 1))
done

# Filter CR issues (no PRs, must have a CR label)
CR_ISSUES=$(echo "$ALL_ISSUES" | jq -c '[.[] | select(.pull_request == null) | select(.labels[].name | startswith("CR:"))] | unique_by(.number) | .[]')

echo "$CR_ISSUES" | while read -r issue; do
  NUMBER=$(echo "$issue" | jq -r '.number')
  TITLE=$(echo "$issue" | jq -r '.title')
  LABELS=$(echo "$issue" | jq -r '[.labels[].name] | join("|")')
  CREATED=$(echo "$issue" | jq -r '.created_at' | cut -c1-10)
  URL=$(echo "$issue" | jq -r '.html_url')

  # Determine status
  STATUS="-"
  for S in "CR:Deployed" "CR:Done" "CR:In Progress" "CR:Approved" "CR:Hold" "CR:Rejected" "CR:New"; do
    if echo "$LABELS" | grep -q "$S"; then STATUS="$S"; break; fi
  done

  # Fetch comments via API
  COMMENTS=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/repos/$REPO/issues/$NUMBER/comments?per_page=100" \
    | jq -r '.[].body' | tr '\n' ' ')

  APPROVED_BY=$(echo "$COMMENTS" | grep -o 'Approved By.*' | head -1 | sed 's/.*@//' | awk '{print $1}' | tr -d '|')
  APPROVAL_DATE=$(echo "$COMMENTS" | grep -o 'Approval Date.*' | head -1 | awk '{print $NF}' | tr -d '|')
  PR=$(echo "$COMMENTS" | grep -oE 'PR.*#[0-9]+' | grep -oE '#[0-9]+' | head -1)
  COMMIT=$(echo "$COMMENTS" | grep -oE '[a-f0-9]{40}' | head -1 | cut -c1-7)
  MERGED=$(echo "$COMMENTS" | grep -o 'Merge Date.*' | head -1 | awk '{print $NF}' | tr -d '|')
  DEPLOYED=$(echo "$COMMENTS" | grep -o 'Deployed At.*' | head -1 | awk '{print $NF}' | tr -d '|')
  DEPLOY_BY=$(echo "$COMMENTS" | grep -o 'Deployment Approved By.*' | head -1 | sed 's/.*@//' | awk '{print $1}' | tr -d '|')

  echo "#${NUMBER},\"${TITLE}\",${STATUS},${CREATED},${APPROVED_BY:-"-"},${APPROVAL_DATE:-"-"},${PR:-"-"},${COMMIT:-"-"},${MERGED:-"-"},${DEPLOYED:-"-"},${DEPLOY_BY:-"-"}" >> $OUTPUT
done

echo ""
echo "Report saved: $OUTPUT"
echo ""
column -t -s ',' $OUTPUT
