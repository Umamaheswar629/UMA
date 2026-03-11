const fs = require('fs');

function replaceFile(path, search, replace) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    if (typeof search === 'string') {
        content = content.split(search).join(replace);
    } else {
        content = content.replace(search, replace);
    }
    fs.writeFileSync(path, content);
}

replaceFile('src/app/features/admin/users/users.component.ts', /DataTableComponent,\s*/g, '');
replaceFile('src/app/features/agent/agent-policies/agent-policies.component.ts', /DataTableComponent,\s*/g, '');
replaceFile('src/app/features/agent/agent-policies/agent-policies.component.ts', 'p.id', 'p.policyId');
replaceFile('src/app/features/agent/agent-policies/agent-policies.component.ts', 'p.planTier', 'p.tierName');

replaceFile('src/app/features/customer/claims/claims.component.ts', /DataTableComponent,\s*/g, '');
replaceFile('src/app/features/customer/claims/claims.component.ts', `selectedClaim()?.assignedOfficerId`, `selectedClaim()?.officerId`);

replaceFile('src/app/features/customer/customer-dashboard/customer-dashboard.component.ts', /,\s*DataTableComponent/, '');
replaceFile('src/app/features/customer/customer-dashboard/customer-dashboard.component.ts', `[value]="data.nextRenewalDate ? (data.nextRenewalDate | date) : 'None'"`, `[value]="data.nextRenewalDate ? (data.nextRenewalDate | date)! : 'None'"`);

replaceFile('src/app/features/officer/claims/claims.component.ts', /DataTableComponent,\s*/g, '');

replaceFile('src/app/features/customer/policies/policies.component.ts', `{{ selectedPolicy()!.planTier }}`, `{{ selectedPolicy()!.tierName || selectedPolicy()!.planName }}`);

replaceFile('src/app/features/customer/quotes/quotes.component.ts', `{{ quote.planTier }}`, `{{ quote.tierName }}`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `[status]="quote.riskLevel"`, `[status]="quote.riskScore?.level || 'Low'"`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `{{ quote.multiplier }}`, `{{ quote.riskScore?.multiplier }}`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `*ngIf="quote.status === 'Available'"`, `*ngIf="!quote.isConverted"`);

replaceFile('src/app/features/customer/quotes/quotes.component.ts', `{{ q.planTier }}`, `{{ q.tierName }}`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `[status]="q.riskLevel"`, `[status]="q.riskScore?.level || 'Low'"`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `[status]="q.status === 'Converted' ? 'Approved' : 'Pending'"`, `[status]="q.isConverted ? 'Approved' : 'Pending'"`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `*ngIf="q.status === 'Available'"`, `*ngIf="!q.isConverted"`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `*ngIf="q.status === 'Converted'"`, `*ngIf="q.isConverted"`);
replaceFile('src/app/features/customer/quotes/quotes.component.ts', `<span *ngIf="q.status === 'Expired'" class="text-gray-500 text-xs">Expired</span>`, ``);
