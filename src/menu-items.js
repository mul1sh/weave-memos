export default {
    items: [
        {
            id: 'navigation',
            title: 'Home',
            type: 'group',
            icon: 'icon-navigation',
            children: [
                {
                    id: 'voice-memos',
                    title: 'Voice Memos',
                    type: 'item',
                    url: '/memos',
                    icon: 'feather icon-mic',
                },
                {
                    id: 'logout',
                    title: 'Log Out',
                    type: 'item',
                    url: '/logout',
                    icon: 'feather icon-log-out',
                }

            ]
        }
    ]
}