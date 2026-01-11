using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations.AuthDb
{
    /// <inheritdoc />
    public partial class AddPublicUserIdToUserAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "UserAccounts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicUserId",
                table: "UserAccounts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullName",
                table: "UserAccounts");

            migrationBuilder.DropColumn(
                name: "PublicUserId",
                table: "UserAccounts");
        }
    }
}
