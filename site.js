const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.querySelector('#year').textContent=new Date().getFullYear();
const form=document.querySelector('#contactForm'),interest=document.querySelector('#interest');
document.querySelector('#applyButton')?.addEventListener('click',()=>{interest.selectedIndex=0;interest.dispatchEvent(new Event('change'));document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});form.elements.name.focus({preventScroll:true})});
interest?.addEventListener('change',()=>{const trainee=interest.selectedIndex===0;form.elements.message.placeholder=trainee?'Tell us about your background and why you’re interested…':'How can our team help you?';form.querySelector('button').firstChild.textContent=trainee?'Send your interest ':'Send enquiry '});
form?.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('button'),status=form.querySelector('.form-msg'),data=Object.fromEntries(new FormData(form));const trainee=interest.selectedIndex===0;data.message='['+data.interest+']\n'+data.message;button.disabled=true;status.className='form-msg';status.textContent='Sending your details…';try{const r=await fetch('api.php?action=enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok||!result.ok)throw Error('submission');status.className='form-msg success';status.textContent=trainee?'Thank you. Your interest has been received. The Farmax team will contact you to discuss the opportunity.':'Thank you. Your enquiry has been received. Our team will contact you.';form.reset();interest.dispatchEvent(new Event('change'))}catch{status.className='form-msg error';status.textContent='We couldn’t send your details. Please try again, or call 071 662 0407. Your information is still in the form.'}finally{button.disabled=false}});
if(interest && location.pathname.endsWith('contact.html')){interest.selectedIndex=new URLSearchParams(location.search).get('interest')==='produce'?2:3;interest.dispatchEvent(new Event('change'));}
// Static hosting explicitly hands the enquiry to WhatsApp for the visitor to send.
if(location.hostname.endsWith('.github.io')){
  document.querySelectorAll('a[href="admin.php"]').forEach(a=>a.remove());
  if(form){
    const update=()=>{form.querySelector('button').firstChild.textContent='Continue on WhatsApp ';};
    interest.addEventListener('change',update);update();
    const notice=document.createElement('p');notice.className='note';notice.textContent='Your details will open in WhatsApp. Review the message and press Send to contact Farmax.';form.querySelector('button').before(notice);
    form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const d=Object.fromEntries(new FormData(form));const message=['Hello Farmax, I am interested in: '+d.interest,'Name: '+d.name,'Phone: '+d.phone,'Email: '+(d.email||'Not provided'),'',d.message].join('\n');window.open('https://wa.me/94716620407?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');form.querySelector('.form-msg').textContent='Continue in WhatsApp and press Send to submit your enquiry.';},true);
  }
}
