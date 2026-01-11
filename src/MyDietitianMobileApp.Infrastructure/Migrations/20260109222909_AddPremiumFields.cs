using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPremiumFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlanDays_DietPlans_DietPlanId1",
                table: "DietPlanDays");

            migrationBuilder.DropForeignKey(
                name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId1",
                table: "DietPlanMeals");

            migrationBuilder.AlterColumn<Guid>(
                name: "DietPlanDayId1",
                table: "DietPlanMeals",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "DietPlanId1",
                table: "DietPlanDays",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PremiumActivatedAt",
                table: "Clients",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MealCompliances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanMealId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AlternativeRecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    MarkedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealCompliances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealCompliances_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MealCompliances_DietPlanMeals_DietPlanMealId",
                        column: x => x.DietPlanMealId,
                        principalTable: "DietPlanMeals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealCompliances_ClientId",
                table: "MealCompliances",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_MealCompliances_DietPlanMealId",
                table: "MealCompliances",
                column: "DietPlanMealId");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlanDays_DietPlans_DietPlanId1",
                table: "DietPlanDays",
                column: "DietPlanId1",
                principalTable: "DietPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId1",
                table: "DietPlanMeals",
                column: "DietPlanDayId1",
                principalTable: "DietPlanDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DietPlanDays_DietPlans_DietPlanId1",
                table: "DietPlanDays");

            migrationBuilder.DropForeignKey(
                name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId1",
                table: "DietPlanMeals");

            migrationBuilder.DropTable(
                name: "MealCompliances");

            migrationBuilder.DropColumn(
                name: "PremiumActivatedAt",
                table: "Clients");

            migrationBuilder.AlterColumn<Guid>(
                name: "DietPlanDayId1",
                table: "DietPlanMeals",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "DietPlanId1",
                table: "DietPlanDays",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlanDays_DietPlans_DietPlanId1",
                table: "DietPlanDays",
                column: "DietPlanId1",
                principalTable: "DietPlans",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId1",
                table: "DietPlanMeals",
                column: "DietPlanDayId1",
                principalTable: "DietPlanDays",
                principalColumn: "Id");
        }
    }
}
