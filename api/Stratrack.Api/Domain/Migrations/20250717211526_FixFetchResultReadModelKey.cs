using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Stratrack.Api.Domain.Migrations
{
    /// <inheritdoc />
    public partial class FixFetchResultReadModelKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_DukascopyJobFetchResults",
                table: "DukascopyJobFetchResults");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FileUrl",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<double>(
                name: "Duration",
                table: "DukascopyJobFetchResults",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Symbol",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "TargetTime",
                table: "DukascopyJobFetchResults",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddPrimaryKey(
                name: "PK_DukascopyJobFetchResults",
                table: "DukascopyJobFetchResults",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_DukascopyJobFetchResults",
                table: "DukascopyJobFetchResults");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "DukascopyJobFetchResults");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "DukascopyJobFetchResults");

            migrationBuilder.DropColumn(
                name: "Symbol",
                table: "DukascopyJobFetchResults");

            migrationBuilder.DropColumn(
                name: "TargetTime",
                table: "DukascopyJobFetchResults");

            migrationBuilder.AlterColumn<string>(
                name: "FileUrl",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "DukascopyJobFetchResults",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DukascopyJobFetchResults",
                table: "DukascopyJobFetchResults",
                columns: new[] { "JobId", "FileUrl" });
        }
    }
}
