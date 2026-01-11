using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations.AuthDb
{
    /// <inheritdoc />
    public partial class UpdatePublicUserIdFormat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing PublicUserIds from MD-XXXXXX (9 chars) to MD-XXXX-XXXX-XX (17 chars)
            migrationBuilder.Sql(@"
                UPDATE ""UserAccounts""
                SET ""PublicUserId"" = CONCAT(
                    'MD-',
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || ""Id""::TEXT || '1') FROM 1 FOR 4)),
                    '-',
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || ""Email""::TEXT || '2') FROM 1 FOR 4)),
                    '-',
                    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || ""Id""::TEXT || '3') FROM 1 FOR 2))
                )
                WHERE LENGTH(""PublicUserId"") < 15;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback not supported - ID format downgrade would break existing integrations
            throw new NotSupportedException("Cannot downgrade PublicUserId format. This migration is irreversible.");
        }
    }
}
