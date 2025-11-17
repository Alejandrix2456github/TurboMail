// TurboMail Extension for Shebang OS 1.4 (Requires Unsandboxed Mode)
// This extension provides core communication blocks for the Mailspring client.
(function (Scratch) {
    "use strict";

    // 1. Check for Unsandboxed Mode (CRITICAL)
    if (!Scratch.extensions.unsandboxed) {
        throw new Error("TurboMail requires unsandboxed mode to access 'mailto' links and set status.");
    }
    const vm = Scratch.vm;

    // Define the initial global mail status that other blocks can read/write
    let unreadMailCount = 0;

    class TurboMail {
        constructor() {
            // High-contrast envelope icon (inline SVG)
            this.logo = "https://cdn.jsdelivr.net/gh/Alejandrix2456github/TurboMail@main/TurboMail.png";
        }

        getInfo() {
            return {
                id: "TurboMail",
                name: "TurboMail",
                menuIconURI: this.logo,
                blockIconURI: this.logo,
                color1: "#20c64e", // Shebang Green
                color2: "#19973d",
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: Scratch.translate("Messaging & Status"),
                    },
                    {
                        opcode: "sendEmail",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "send email to [RECIPIENT] with subject [SUBJECT] and body [BODY]",
                        arguments: {
                            RECIPIENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "user@example.com"
                            },
                            SUBJECT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Shebang OS Mail"
                            },
                            BODY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: "Sent from Shebang OS 1.4 Garden."
                            },
                        }
                    },
                    {
                        opcode: "setMailStatus",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set unread mail count to [COUNT]",
                        arguments: {
                            COUNT: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                        }
                    },
                    {
                        opcode: "getMailStatus",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "unread mail count",
                        disableMonitor: true
                    }
                ],
            };
        }

        /**
         * Simulates sending an email by constructing and opening a mailto: link.
         * This leverages the unsandboxed requirement to interact with the browser's native mail client.
         * @param {object} args - Arguments containing RECIPIENT, SUBJECT, and BODY.
         */
        sendEmail(args) {
            // Encode the subject and body to handle spaces and special characters
            const recipient = Scratch.Cast.toString(args.RECIPIENT);
            const subject = encodeURIComponent(Scratch.Cast.toString(args.SUBJECT));
            const body = encodeURIComponent(Scratch.Cast.toString(args.BODY));

            // Construct the mailto link
            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            try {
                // Open the link in a new tab/window. This is the "send" action.
                window.open(mailtoLink);
            } catch (e) {
                console.error("TurboMail Error: Could not open mailto link.", e);
            }
        }

        /**
         * Sets the internal count of unread emails.
         * This block is called by the Mailspring app logic to update the OS status.
         * @param {object} args - Arguments containing the new COUNT.
         */
        setMailStatus(args) {
            const count = Scratch.Cast.toNumber(args.COUNT);
            // Ensure the count is a non-negative integer
            unreadMailCount = Math.max(0, Math.floor(count));
            console.log(`[TurboMail] Unread count updated to: ${unreadMailCount}`);

            // Optional: Dispatch a VM event so other sprites can react immediately
            vm.runtime.requestAddBlock({
                opcode: 'TURBOMAIL_STATUS_UPDATE',
                is_internal: true,
                value: unreadMailCount
            });
        }

        /**
         * Reports the current unread mail count.
         * This block is used by the Taskbar/Notification system.
         */
        getMailStatus() {
            return unreadMailCount;
        }
    }

    Scratch.extensions.register(new TurboMail());
})(Scratch);
