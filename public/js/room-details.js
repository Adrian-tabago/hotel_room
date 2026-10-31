/* Added UI enhancement only — the original room JavaScript above is unchanged. */
(() => {
    const roomPhotos = ['https://images.unsplash.com/photo-1765862835319-18fb6f8caff6?auto=format&fit=crop&fm=jpg&q=86&w=1800', 'https://images.unsplash.com/photo-1760573776062-7d2a7baeb49d?auto=format&fit=crop&fm=jpg&q=86&w=1800', 'https://images.unsplash.com/photo-1766733041960-0de62f403e7b?auto=format&fit=crop&fm=jpg&q=86&w=1800', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&fm=jpg&q=86&w=1800'];
    const list = document.getElementById('roomList');
    const detailModal = document.getElementById('roomDetailModal');
    if (!list || !detailModal) return;

    function photoForCard(card, index) {
        const heading = card.querySelector('h3')?.textContent || '';
        const number = parseInt((heading.match(/\d+/) || [index])[0], 10) || index;
        return roomPhotos[Math.abs(number) % roomPhotos.length];
    }

    function enhanceCards() {
        [...list.querySelectorAll('.card')].forEach((card, index) => {
            if (card.dataset.modernEnhanced === '1') return;
            card.dataset.modernEnhanced = '1';

            const photo = card.querySelector('.photo');
            const cardTop = card.querySelector('.card-top');
            const meta = card.querySelector('.meta');
            const features = card.querySelector('.features');
            const price = card.querySelector('.price');
            const actions = card.querySelector('.actions');
            const heading = card.querySelector('h3');
            const image = photoForCard(card, index);

            if (photo) photo.style.backgroundImage = `url("${image}")`;

            const rawMeta = (meta?.textContent || '').trim();
            const parts = rawMeta.split('·').map(v => v.trim());
            const roomType = parts[0] || 'Hotel Room';
            const floor = parts[1] || 'Floor information';
            const rawFeatures = [...(features?.querySelectorAll('span') || [])].map(s => s.textContent.trim());
            const feature = rawFeatures[0] || 'Room feature';
            const guests = rawFeatures[1] || 'Guest capacity';

            if (features) {
                features.innerHTML = `
                    <span><i class="fa-solid fa-bed"></i>${feature}</span>
                    <span><i class="fa-solid fa-user-group"></i>${guests.replace(/^Up to /i,'')}</span>
                    <span><i class="fa-solid fa-building"></i>${floor}</span>`;
            }

            if (actions && !actions.querySelector('.room-details-btn')) {
                const details = document.createElement('button');
                details.type = 'button';
                details.className = 'btn room-details-btn';
                details.innerHTML = '<i class="fa-regular fa-eye"></i>&nbsp; View Details';
                details.dataset.roomDetails = '1';
                details.dataset.title = heading?.textContent || 'Room Details';
                details.dataset.type = roomType;
                details.dataset.floor = floor;
                details.dataset.feature = feature;
                details.dataset.guests = guests;
                details.dataset.price = price?.textContent.trim() || '';
                details.dataset.photo = image;
                actions.prepend(details);
            }
        });
    }

    function openDetails(btn) {
        document.getElementById('roomDetailTitle').textContent = btn.dataset.title || 'Room Details';
        document.getElementById('roomDetailMeta').textContent = btn.dataset.type || '';
        document.getElementById('roomDetailRate').innerHTML = `${btn.dataset.price || ''}<small>current nightly rate</small>`;
        document.getElementById('roomDetailFeature').textContent = btn.dataset.feature || 'Room feature';
        document.getElementById('roomDetailGuests').textContent = btn.dataset.guests || 'Guest capacity';
        document.getElementById('roomDetailFloor').textContent = btn.dataset.floor || 'Floor';
        document.getElementById('roomDetailPhoto').style.backgroundImage = `url("${btn.dataset.photo}")`;
        detailModal.classList.add('open');
        detailModal.setAttribute('aria-hidden','false');
    }
    function closeDetails() {
        detailModal.classList.remove('open');
        detailModal.setAttribute('aria-hidden','true');
    }

    new MutationObserver(enhanceCards).observe(list, {childList:true});
    enhanceCards();
    document.addEventListener('click', e => {
        const detailBtn = e.target.closest('[data-room-details="1"]');
        if (detailBtn) { e.preventDefault(); openDetails(detailBtn); }
        if (e.target.id === 'roomDetailClose' || e.target.id === 'roomDetailDone' || e.target === detailModal) closeDetails();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetails(); });
})();
    
