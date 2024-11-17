package cmd

import (
	"ags/lib"

	"github.com/spf13/cobra"
)

var reqCommand = &cobra.Command{
	Use:   "request [message]",
	Short: "Send a request to an instance",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		instance, _ := cmd.Flags().GetString("instance")
		lib.Astal("--instance", instance, args[0])
	},
}

func init() {
	lib.AddInstanceFlag(reqCommand)
}
