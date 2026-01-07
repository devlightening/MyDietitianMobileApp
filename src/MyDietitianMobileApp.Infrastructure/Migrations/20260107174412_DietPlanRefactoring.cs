using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyDietitianMobileApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DietPlanRefactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealItemCompliance_DietDays_DietDayId",
                table: "MealItemCompliance");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItemCompliance_Meals_MealId",
                table: "MealItemCompliance");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_Meals_MealId",
                table: "MealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_Meals_MealId1",
                table: "MealItems");

            migrationBuilder.DropTable(
                name: "Meals");

            migrationBuilder.DropTable(
                name: "DietDays");

            migrationBuilder.DropIndex(
                name: "IX_DietPlans_ClientId_IsActive",
                table: "DietPlans");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "DietPlans");

            migrationBuilder.RenameColumn(
                name: "MealId1",
                table: "MealItems",
                newName: "DietPlanMealId");

            migrationBuilder.RenameIndex(
                name: "IX_MealItems_MealId1",
                table: "MealItems",
                newName: "IX_MealItems_DietPlanMealId");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "DietPlans",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "DietPlanDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DailyTargetCalories = table.Column<int>(type: "integer", nullable: true),
                    DietPlanId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlanDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietPlanDays_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DietPlanDays_DietPlans_DietPlanId1",
                        column: x => x.DietPlanId1,
                        principalTable: "DietPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DietPlanMeals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    PlannedRecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    CustomName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    DietPlanDayId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietPlanMeals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId",
                        column: x => x.DietPlanDayId,
                        principalTable: "DietPlanDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DietPlanMeals_DietPlanDays_DietPlanDayId1",
                        column: x => x.DietPlanDayId1,
                        principalTable: "DietPlanDays",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_ClientId_Status",
                table: "DietPlans",
                columns: new[] { "ClientId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanDays_DietPlanId",
                table: "DietPlanDays",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanDays_DietPlanId_Date",
                table: "DietPlanDays",
                columns: new[] { "DietPlanId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanDays_DietPlanId1",
                table: "DietPlanDays",
                column: "DietPlanId1");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanMeals_DietPlanDayId",
                table: "DietPlanMeals",
                column: "DietPlanDayId");

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanMeals_DietPlanDayId_Type",
                table: "DietPlanMeals",
                columns: new[] { "DietPlanDayId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlanMeals_DietPlanDayId1",
                table: "DietPlanMeals",
                column: "DietPlanDayId1");

            migrationBuilder.AddForeignKey(
                name: "FK_MealItemCompliance_DietPlanDays_DietDayId",
                table: "MealItemCompliance",
                column: "DietDayId",
                principalTable: "DietPlanDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItemCompliance_DietPlanMeals_MealId",
                table: "MealItemCompliance",
                column: "MealId",
                principalTable: "DietPlanMeals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_DietPlanMeals_DietPlanMealId",
                table: "MealItems",
                column: "DietPlanMealId",
                principalTable: "DietPlanMeals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_DietPlanMeals_MealId",
                table: "MealItems",
                column: "MealId",
                principalTable: "DietPlanMeals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MealItemCompliance_DietPlanDays_DietDayId",
                table: "MealItemCompliance");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItemCompliance_DietPlanMeals_MealId",
                table: "MealItemCompliance");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_DietPlanMeals_DietPlanMealId",
                table: "MealItems");

            migrationBuilder.DropForeignKey(
                name: "FK_MealItems_DietPlanMeals_MealId",
                table: "MealItems");

            migrationBuilder.DropTable(
                name: "DietPlanMeals");

            migrationBuilder.DropTable(
                name: "DietPlanDays");

            migrationBuilder.DropIndex(
                name: "IX_DietPlans_ClientId_Status",
                table: "DietPlans");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "DietPlans");

            migrationBuilder.RenameColumn(
                name: "DietPlanMealId",
                table: "MealItems",
                newName: "MealId1");

            migrationBuilder.RenameIndex(
                name: "IX_MealItems_DietPlanMealId",
                table: "MealItems",
                newName: "IX_MealItems_MealId1");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "DietPlans",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "DietDays",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DietPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietPlanId1 = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DietDays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DietDays_DietPlans_DietPlanId",
                        column: x => x.DietPlanId,
                        principalTable: "DietPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DietDays_DietPlans_DietPlanId1",
                        column: x => x.DietPlanId1,
                        principalTable: "DietPlans",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Meals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DietDayId = table.Column<Guid>(type: "uuid", nullable: false),
                    DietDayId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Meals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Meals_DietDays_DietDayId",
                        column: x => x.DietDayId,
                        principalTable: "DietDays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Meals_DietDays_DietDayId1",
                        column: x => x.DietDayId1,
                        principalTable: "DietDays",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DietPlans_ClientId_IsActive",
                table: "DietPlans",
                columns: new[] { "ClientId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId",
                table: "DietDays",
                column: "DietPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId_Date",
                table: "DietDays",
                columns: new[] { "DietPlanId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DietDays_DietPlanId1",
                table: "DietDays",
                column: "DietPlanId1");

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId",
                table: "Meals",
                column: "DietDayId");

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId_Type",
                table: "Meals",
                columns: new[] { "DietDayId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Meals_DietDayId1",
                table: "Meals",
                column: "DietDayId1");

            migrationBuilder.AddForeignKey(
                name: "FK_MealItemCompliance_DietDays_DietDayId",
                table: "MealItemCompliance",
                column: "DietDayId",
                principalTable: "DietDays",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItemCompliance_Meals_MealId",
                table: "MealItemCompliance",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_Meals_MealId",
                table: "MealItems",
                column: "MealId",
                principalTable: "Meals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MealItems_Meals_MealId1",
                table: "MealItems",
                column: "MealId1",
                principalTable: "Meals",
                principalColumn: "Id");
        }
    }
}
