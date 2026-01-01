using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIngredientCanonicalNameAndAliases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Ingredients",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "CanonicalName",
                table: "Ingredients",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Aliases",
                table: "Ingredients",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Ingredients",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            // Data migration: Copy existing Name values to CanonicalName
            migrationBuilder.Sql("""
                UPDATE "Ingredients"
                SET "CanonicalName" = "Name"
                WHERE "CanonicalName" = '';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_CanonicalName",
                table: "Ingredients",
                column: "CanonicalName");

            migrationBuilder.CreateIndex(
                name: "IX_Ingredients_IsActive",
                table: "Ingredients",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ingredients_CanonicalName",
                table: "Ingredients");

            migrationBuilder.DropIndex(
                name: "IX_Ingredients_IsActive",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "Aliases",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "CanonicalName",
                table: "Ingredients");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Ingredients");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Ingredients",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);
        }
    }
}
