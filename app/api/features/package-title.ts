function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function titleMentionsPackage(title: string, packageName: string) {
  const barePackageName = packageName.replace(/^@tscircuit\//, "");
  const pattern = new RegExp(
    `(?:^|[^a-z0-9/_-])(?:@tscircuit/)?${escapeRegExp(barePackageName)}(?![a-z0-9_-])`,
    "i",
  );
  return pattern.test(title);
}
