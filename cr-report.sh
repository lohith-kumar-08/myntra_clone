#!/bin/bash

REPO="lohith-kumar-08/myntra_clone"
OUTPUT="cr-report-$(date +%Y-%m-%d).csv"

echo "Generating CR report for $REPO..."
echo ""

# CSV Header
echo "CR_ID,Title,Status,Approved_By,Approval_Date,PR,Commit_SHA,Merged_Date,Deployed_At,Deployment_Approved_By" > $OUTPUT

# Fetch issues for each CR label separately and merge
ISSUES=$(for label in "CR:New" "CR:Approved" "CR:In Progress" "CR:Done" "CR:Deployed" "CR:Rejected"; do
  gh issue list --repo $REPO --label "$label" --state all --limit 500 --json number,title,labels,url 2>/dev/null
done | jq -s '[.[][] ] | unique_by(.number) | .[]' -c)

echo "$ISSUES" | while read -r issue; do

  NUMBER=$(echo $issue | jq -r '.number')
  TITLE=$(echo $issue | jq -r '.title')
  LABELS=$(echo $issue | jq -r '[.labels[].name] | join("|")')

  # Determine status from labels
  STATUS=""
  if echo "$LABELS" | grep -q "CR:Deployed"; then STATUS="CR:Deployed"
  elif echo "$LABELS" | grep -q "CR:Done"; then STATUS="CR:Done"
  elif echo "$LABELS" | grep -q "CR:In Progress"; then STATUS="CR:In Progress"
  elif echo "$LABELS" | grep -q "CR:Approved"; then STATUS="CR:Approved"
  elif echo "$LABELS" | grep -q "CR:Rejected"; then STATUS="CR:Rejected"
  elif echo "$LABELS" | grep -q "CR:New"; then STATUS="CR:New"
  fi

  # Extract fields from comments
  COMMENTS=$(gh issue view $NUMBER --repo $REPO --json comments -q '.comments[].body')

  APPROVED_BY=$(echo "$COMMENTS" | grep -A2 "CR Approved" | grep "Approved By" | sed 's/.*@//' | tr -d '|' | xargs)
  APPROVAL_DATE=$(echo "$COMMENTS" | grep -A3 "CR Approved" | grep "Approval Date" | awk '{print $NF}' | tr -d '|' | xargs)
  PR=$(echo "$COMMENTS" | grep -oE '#[0-9]+' | head -1 | tr -d '#')
  COMMIT_SHA=$(echo "$COMMENTS" | grep "Commit SHA" | grep -oE '[a-f0-9]{40}')
  MERGED_DATE=$(echo "$COMMENTS" | grep "Merge Date" | awk '{print $NF}' | tr -d '|' | xargs)
  DEPLOYED_AT=$(echo "$COMMENTS" | grep "Deployed At" | awk '{print $NF}' | tr -d '|' | xargs)
  DEPLOY_APPROVED_BY=$(echo "$COMMENTS" | grep "Deployment Approved By" | sed 's/.*@//' | tr -d '|' | xargs)

  echo "#${NUMBER},\"${TITLE}\",${STATUS},${APPROVED_BY},${APPROVAL_DATE},${PR:+#$PR},${COMMIT_SHA},${MERGED_DATE},${DEPLOYED_AT},${DEPLOY_APPROVED_BY}" >> $OUTPUT

done

echo "Report saved to: $OUTPUT"
echo ""
cat $OUTPUT | column -t -s ','
